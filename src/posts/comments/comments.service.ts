import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from '../../common/common.service';
import { UsersModel } from '../../users/entity/users.entity';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options.const';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { CommentsModel } from './entity/comments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateComments(dto: PaginateCommentsDto, postId: number) {
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        where: {
          id: postId,
        },
        ...DEFAULT_COMMENT_FIND_OPTIONS,
      },
      `posts/${postId}/comments`,
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: id,
      },
      ...DEFAULT_COMMENT_FIND_OPTIONS,
    });

    if (!comment) {
      throw new NotFoundException(`id: ${id}가 존재하지 않습니다.`);
    }

    return comment;
  }

  async createComment(
    postId: number,
    dto: CreateCommentsDto,
    author: UsersModel,
  ) {
    return this.commentsRepository.save({
      ...dto,
      author,
      post: {
        id: postId,
      },
    });
  }

  async updateComment(commentId: number, dto: UpdateCommentsDto) {
    // preload: TypeORM의 메서드로, 특정 id에 해당하는 엔티티를 먼저 DB에서 찾아온 뒤
    // 그 엔티티에 ...dto의 값들을 병합해서 새 엔티티 인스턴스를 만듬. (db에 저장하지는 않음.)

    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });

    if (!prevComment) {
      throw new NotFoundException(`댓글 ID ${commentId}를 찾을 수 없습니다.`);
    }

    const newComment = await this.commentsRepository.save(prevComment);
    return newComment;
  }

  async deleteComment(commentId: number) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`댓글 ID ${commentId}를 찾을 수 없습니다.`);
    }

    await this.commentsRepository.delete({ id: commentId });
    return commentId;
  }
}
