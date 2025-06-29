import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ROLES } from '../../../users/const/roles.const.enum';
import { UsersModel } from '../../../users/entity/users.entity';
import { CommentsService } from '../comments.service';
import { Request } from 'express';

@Injectable()
export class IsCommentMintedOrAdminGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { user: UsersModel } = context
      .switchToHttp()
      .getRequest();
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    // role=admin일 경우 pass
    if (req.user.role === ROLES.ADMIN) {
      return true;
    }

    // role=user인 경우 검증
    const commentId = req.params.commentId; // 파라미터(@Param('postId'))에서 검증하려는 postId를 가져옴.
    if (!commentId) {
      throw new BadRequestException(
        'commentId가 파라미터로 제공되어야 합니다.',
      );
    }

    // user인 경우 자신의 post가 맞는지 검증
    const isOk = await this.commentsService.isCommentMine(
      user.id,
      parseInt(commentId),
    );
    if (!isOk) {
      throw new ForbiddenException('댓글을 변경할 권한이 없습니다.');
    }

    return true;
  }
}
