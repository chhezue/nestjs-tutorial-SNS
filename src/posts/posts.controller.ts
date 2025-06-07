import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { async } from 'rxjs';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { ImageModelType } from '../common/entity/image.entity';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { PostsImagesService } from './image/images.service';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../users/decorator/user.decorator';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersModel } from '../users/entities/users.entity';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  // GET /posts
  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  // GET /posts/:id
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  // Post /posts/random
  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }

  // POST /posts
  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor) // transaction 생성 인터셉터
  async postPosts(
    // @User('id')가 호출되면, user 객체에서 id 속성을 가져옵니다. 즉, req.user.id를 userId에 전달합니다.
    // @User()처럼 data를 주지 않으면, user 객체 전체가 반환됩니다. 이 경우 req.user를 그대로 user 파라미터로 전달받을 수 있습니다.
    @User('id') userId: number, // User Decorator에서 반환된 data의 id 값을 가져옴.
    @Body() body: CreatePostDto,
    @QueryRunner(): qr: QR,
  ) {
    // post 먼저 생성
    const post = await this.postsService.createPost(userId, body, qr);

    // post 생성 후 이미지 생성
    if (body.images?.length) {
      await Promise.all(
        body.images.map((imagePath, index) =>
          this.postsImagesService.createPostImage(
            {
              posts: post,
              order: index,
              path: imagePath,
              type: ImageModelType.POST_IMAGE,
            },
            qr,
          ),
        ),
      );
    }

    return this.postsService.getPostById(post.id);
  }

  // PATCH /posts/:id
  @Patch(':id')
  @UseGuards(AccessTokenGuard)
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
  @UseGuards(AccessTokenGuard)
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
