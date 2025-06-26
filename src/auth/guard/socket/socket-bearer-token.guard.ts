import { CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../../../users/users.service';
import { AuthService } from '../../auth.service';

export class SocketBearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient(); // 현재 연결되어 통신하고 있는 소켓을 가져옴.
    const headers = socket.handshake.headers;
    const rawToken = headers('authorization');

    if (!rawToken) {
      throw new WsException('토큰이 없습니다.');
    }

    try {
      const token = this.authService.extreactTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      const user = this.userService.getUserByEmail(payload.email);

      socket.user = user; // = request.user = user;
      socket.token = token;
      socket.tokenType = payload.tockenType;

      return true;
    } catch (e) {
      throw new WsException('토큰이 유효하지 않습니다.');
    }
  }
}
