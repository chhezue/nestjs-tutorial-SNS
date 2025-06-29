import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IsPublic } from '../../common/decorator/is-public.decorator';
import { User } from '../../users/decorator/user.decorator';
import { UsersModel } from '../../users/entity/users.entity';
import { CommentsService } from './comments.service';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { UpdateCommentsDto } from './dto/update-comments.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @IsPublic()
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() query: PaginateCommentsDto,
  ) {
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  @IsPublic()
  getComment(@Param('commentId') commentId: number) {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  postComment(
    @Param('postId') postId: number, // 맨 위 Controller 데코레이터에서 가져 온 postId
    @Body() body: CreateCommentsDto,
    @User() user: UsersModel,
  ) {
    return this.commentsService.createComment(postId, body, user);
  }

  @Patch(':commentId')
  patchComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentsDto,
  ) {
    return this.commentsService.updateComment(commentId, body);
  }

  @Delete(':commentId')
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentsService.deleteComment(commentId);
  }
}
