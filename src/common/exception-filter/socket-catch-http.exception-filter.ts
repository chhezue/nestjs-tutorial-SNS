import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch(HttpException) // 모든 http exception을 다 잡음.
export class SocketCatchHttpExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const socket = host.switchToWs().getClient(); // 소켓 객체를 불러옴.
    socket.emit('exception', {
      data: exception.getResponse(), // 응답으로 어떤 값(실제 에러)을 받았는지 불러옴.
    });
  }
}
