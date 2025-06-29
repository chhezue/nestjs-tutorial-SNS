import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // getAllAndOverride: 핸들러에 설정된 메타데이터가 있으면 그걸 사용하고, 없으면 클래스에 전체에 적용된 값을 사용
    const requiredRole = await this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Roles Annotaion이 등록되어 있지 않은 경우
    if (!requiredRole) {
      return true; // RBAC을 할 필요가 없는 경우이므로 true 반환
    }

    const { user } = context.switchToHttp().getRequest();

    // 로그인되지 않은 경우(토큰 가드 검증 실패)
    if (!user) {
      throw new UnauthorizedException('인증 실패: 토큰이 제공되지 않았습니다.');
    }

    // 현재 사용자의 role과 요구되는 role이 다른 경우
    if (user.role !== requiredRole) {
      throw new ForbiddenException(
        `이 작업을 수행할 권한이 없습니다. ${requiredRole} 권한이 필요합니다.`,
      );
    }

    return true;
  }
}
