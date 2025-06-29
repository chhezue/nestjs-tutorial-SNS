import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorator/is-public.decorator';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  // true: 가드 통과 성공, false: 가드 통과 실패
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // getAllAndOverride: 핸들러에 설정된 메타데이터가 있으면 그걸 사용하고, 없으면 클래스에 전체에 적용된 값을 사용
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();

    // IsPublic 이라는 데코레이터가 적용되어 있으면 토큰 인증 불필요 (바로 true 반환)
    if (isPublic) {
      req.isPublicRoute = true; // 커스텀 헤더 (퍼블릭 라우트라면 access, refresh 인증 모두 건너뜀.)
      return true;
    }

    const rawToken = req.headers['authorization']; // 'Basic ...' 형태
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extreactTokenFromHeader(rawToken, false); // Basic 토큰이므로 false
    const payload = await this.authService.verifyToken(token); // 토큰 검증

    /**
     * [request(요청)에 넣을 정보]
     * 1) 사용자(user) 객체
     * 2) token
     * 3) token의 type(access || refresh) -> payload에 저장되어 있음.
     */

    req.token = token;
    req.tokenType = payload.type;
    req.user = await this.userService.getUserByEmail(payload.email);

    return true;
  }
}

// 전역 적용된 가드
@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context); // 부모 클래스(BearerTokenGuard)에 정의된 canActivate 메소드 호출

    const req = context.switchToHttp().getRequest();

    if (req.isPublicRoute) {
      return true;
    }

    // 검증 후 토큰 구분
    // 어떤 종류의 토큰이든 유효한지 아닌지 먼저 판단할 수 있기 때문. 잘못된 토큰 형식이나 만료된 토큰이라면 바로 예외를 던질 수 있음.
    if (req.tokenType !== 'access') {
      throw new UnauthorizedException('Access Token이 아닙니다.');
    }

    return true;
  }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const req = context.switchToHttp().getRequest();

    if (req.isPublicRoute) {
      return true;
    }

    if (req.tokenType !== 'refresh') {
      throw new UnauthorizedException('Refresh Token이 아닙니다.');
    }

    return true;
  }
}
