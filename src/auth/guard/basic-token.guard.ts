import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * [구현할 기능]
 * 1) 요청 객체(request)를 불러온 후 authorization header로부터 토큰을 가져온다.
 * 2) authService.extractTokenFromHeader를 이용해서 사용 가능한 형태의 토큰을 추출한다.
 * 3) authService.decodeBasicToken을 실행해서 email과 password를 추출한다.
 * 4) authService.authenticateWithEmailAndPassword를 이용해서 email과 password를 이용해서 사용자를 가져온다.
 * 5) 찾아낸 사용자를 (1) 요청 객체에 붙여 준다. (요청이 응답으로 나가기 직전까지) -> req.user = user; 로 가져올 수 있다.
 */

export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  // true: 가드 통과 성공, false: 가드 통과 실패
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization']; // 'Basic ...' 형태
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extreactTokenFromHeader(rawToken, false); // Basic 토큰이므로 false

    const { email, password } = this.authService.decodedBasicToken(token);

    const user = this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    // 가져온 사용자(user)가 요청 객체(request)의 user에 들어감.
    // 응답으로 돌아가기 전까지 살아 있음.
    req.user = user;

    return true;
  }
}
