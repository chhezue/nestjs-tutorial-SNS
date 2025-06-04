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
  UploadedFile,
} from '@nestjs/common';
import { LogInterceptor } from '../common/interceptor/log.interceptor';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { User } from '../users/decorator/user.decorator';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersModel } from '../users/entities/users.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
  postPosts(
    // @User('id')가 호출되면, user 객체에서 id 속성을 가져옵니다. 즉, req.user.id를 userId에 전달합니다.
    // @User()처럼 data를 주지 않으면, user 객체 전체가 반환됩니다. 이 경우 req.user를 그대로 user 파라미터로 전달받을 수 있습니다.
    @User('id') userId: number, // User Decorator에서 반환된 data의 id 값을 가져옴.
    @Body() body: CreatePostDto,
  ) {
    return this.postsService.createPost(userId, body);
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
