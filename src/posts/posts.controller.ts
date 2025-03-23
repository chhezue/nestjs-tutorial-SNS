import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';

/**
 * author: string;
 * title: string;
 * content: string;
 * likeCount: number;
 * commentCount: number;
 */

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: 'newjeans_official',
    title: '뉴진스 민지',
    content: '메이크업 고치고 있는 민지',
    likeCount: 100,
    commentCount: 99,
  },
  {
    id: 2,
    author: 'newjeans_official',
    title: '뉴진스 해린',
    content: '노래 연습 하고 있는 해린',
    likeCount: 100,
    commentCount: 99,
  },
  {
    id: 3,
    author: 'blackpink_official',
    title: '블랙핑크 로제',
    content: '종합운동장에서 공연하고 있는 로제',
    likeCount: 100,
    commentCount: 99,
  },
];

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // GET /posts
  @Get()
  getPosts() {
    return posts;
  }

  // GET /posts/:id
  @Get(':id')
  getPost(@Param() id: string) {
    // +id: string으로 받은 id를 숫자형으로 변환
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  // POST /posts
  @Post()
  postPosts(
    // request body에서 author 값을 받아서 author라는 변수에 string 형으로 할당
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author: author,
      title: title,
      content: content,
      likeCount: 0,
      commentCount: 0,
    };

    posts = [...posts, post];

    return post;
  }

  // PATCH /posts/:id
  @Patch(':id')
  patchPost(
    @Param() id: string,
    // ? 연산자를 사용하여 null일 수도 있음을 명시
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    const post = posts.find((post) => post.id === +id);
    if (!post) {
      throw new NotFoundException();
    }

    // 존재하는 값만 수정
    if (author) {
      post.author = author;
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    posts = posts.map((prevPost) => (prevPost.id === +id ? post : prevPost));
    return post;
  }

  // Delete /posts/:id
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }

    // 조건을 만족하는 요소만 걸러서 새로운 배열 생성
    // 삭제할 포스트가 아닌 것만 걸러서 새로운 배열 생성
    posts = posts.filter((post) => post.id !== +id);
    return id;
  }
}
