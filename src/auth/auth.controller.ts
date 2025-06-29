import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { IsPublic } from '../common/decorator/is-public.decorator';
import { AuthService } from './auth.service';
import { MaxLengthPipe, MinLengthPipe } from './pipe/password.pipe';
import { BasicTokenGuard } from './guard/basic-token.guard';
import {
  AccessTokenGuard,
  RefreshTokenGuard,
} from './guard/bearer-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // access token 발급
  @Post('token/access')
  @IsPublic()
  @UseGuards(AccessTokenGuard)
  postTokenAccess(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extreactTokenFromHeader(
      rawToken,
      false, // basic 토큰이므로
    );

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  // refresh token 발급
  @Post('token/refresh')
  @IsPublic()
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extreactTokenFromHeader(
      rawToken,
      true, // bearer 토큰이므로
    );

    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post('login/email')
  @IsPublic()
  @UseGuards(BasicTokenGuard) // 로그인할 때 가드 사용
  async postLoginEmail(
    // header에서 토큰을 받는 형식으로 변경
    @Headers('Authorization') rawToken: string,
  ) {
    const token = this.authService.extreactTokenFromHeader(rawToken, false); // base64 형태의 토큰 추출
    const credentials = this.authService.decodedBasicToken(token); // base64 형태의 토큰을 디코딩
    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  @IsPublic()
  postRegisterEmail(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password', new MaxLengthPipe(8), new MinLengthPipe(3))
    password: string,
  ) {
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    });
  }
}
