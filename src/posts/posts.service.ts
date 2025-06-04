import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { join, basename } from 'path';
import { Repository } from 'typeorm';
import {
  POSTS_IMAGE_PATH,
  PUBLIC_FOLDER_PATH,
} from '../common/const/path.const';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from '../common/common.service';
import { promises } from 'fs';

@Injectable()
export class PostsService {
  constructor(
    // PostsModel을 다루는 repository를 정의함.
    // 모델을 만들 때, 모델에 해당되는 리포지토리를 주입하고 싶을 때 작성
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      { relations: ['author'] },
      'posts',
    );
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: { id: id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });
    return await this.postsRepository.save(post);
  }

  async updatePost(postId: number, title?: string, content?: string) {
    /**
     * [save의 기능]
     * 1. id를 기준으로 만약에 문서가 존재하지 않는다면 새로 생성한다.
     * 2. 만약에 데이터가 존재한다면(같은 id 값이 존재한다면) 존재하던 값을 업데이트한다.
     */

    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    return await this.postsRepository.save(post);
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }
    await this.postsRepository.delete(postId);

    return postId;
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `random title ${i}`,
        content: `random content ${i}`,
      });
    }
  }

  async createPostImage(dto: CreatePostDto) {
    // dto의 이미지 이름을 기반으로 파일의 경로를 생성한다.
    const tempFilePath = join(PUBLIC_FOLDER_PATH, dto.images || '');

    try {
      // 파일이 존재하는지 확인
      // 만약에 존재하지 않는다면 에러를 발생시킴.
      await promises.access(tempFilePath);
    } catch (error) {
      throw new BadRequestException('존재하지 않는 파일입니다.', error);
    }

    // 파일 이름만 가져오기
    const fileName = basename(tempFilePath);

    // 새로 이동할 포스트 폴더의 경로
    const newPath = join(POSTS_IMAGE_PATH, fileName);

    // 파일 옮기기 (temp -> public)
    await promises.rename(tempFilePath, newPath);

    return true;
  }
}
