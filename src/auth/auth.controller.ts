import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MaxLengthPipe, MinLengthPipe } from './pipe/password.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token/access')
  // access token 발급
  async postTokenAccess(@Headers('Authorization') rawToken: string) {
    const token = await this.authService.extreactTokenFromHeader(
      rawToken,
      false, // basic 토큰이므로
    );

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }

  @Post('token/refresh')
  // refresh token 발급
  async postTokenRefresh(@Headers('Authorization') rawToken: string) {
    const token = await this.authService.extreactTokenFromHeader(
      rawToken,
      true, // bearer 토큰이므로
    );

    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    };
  }

  @Post('login/email')
  async postLoginEmail(
    // header에서 토큰을 받는 형식으로 변경
    @Headers('Authorization') rawToken: string,
  ) {
    const token = await this.authService.extreactTokenFromHeader(
      rawToken,
      false,
    ); // base64 형태의 토큰 추출
    const credentials = await this.authService.decodedBasicToken(token); // base64 형태의 토큰을 디코딩
    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
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
