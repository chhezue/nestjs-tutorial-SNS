import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // GET /posts
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  // GET /posts/:id
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // POST /posts
  @Post()
  postPosts(
    // request body에서 author 값을 받아서 author라는 변수에 string 형으로 할당
    @Body('authorId') authorId: number,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(authorId, title, content);
  }

  // PATCH /posts/:id
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    // ? 연산자를 사용하여 null일 수도 있음을 명시
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, title, content);
  }

  // Delete /posts/:id
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
