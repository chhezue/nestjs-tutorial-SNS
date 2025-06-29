import { UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { SocketCatchHttpExceptionFilter } from '../common/exception-filter/socket-catch-http.exception-filter';
import { UsersModel } from '../users/entity/users.entity';
import { UsersService } from '../users/users.service';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto } from './messages/dto/create-messages.dto';
import { MessagesService } from './messages/messages.service';

@WebSocketGateway({
  namespace: 'chats', // ws://localhost:3000/chats
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server; // 서버 객체(IO 생성)

  afterInit(server: any) {
    console.log(`After gateway init: ${server}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`on disconnect called: ${socket.id}`);
  }

  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called: ${socket.id}`);

    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];

    if (!rawToken) {
      socket.disconnect();
    }

    try {
      const token = this.authService.extreactTokenFromHeader(rawToken, true);
      const payload = this.authService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      if (!user) {
        socket.disconnect();
      } else {
        socket.user = user; // = request.user = user;
        return true;
      }
    } catch (err) {
      socket.disconnect();
    }
  }

  // join(): room에 들어간다는 의미
  @UseFilters(SocketCatchHttpExceptionFilter) // http 에러 발생 시 알맞은 형식으로 변경해줌.
  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    // 입장하려는 채팅방이 유효한지 검사
    for (const chatId of data.chatIds) {
      const exist = await this.chatsService.checkIfChatExists(chatId);

      if (!exist) {
        throw new WsException({
          message: `존재하지 않는 chatId: ${chatId}`,
        });
      }
    }

    socket.join(data.chatIds.map((x) => x.toString()));
  }

  // on(subscribe): 메세지를 받는다는 의미
  // socket.on('send_message', (message) => {console.log(message)});
  @UseFilters(SocketCatchHttpExceptionFilter) // http 에러 발생 시 알맞은 형식으로 변경해줌.
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    // socket이라는 변수에 user라는 정보가 붙어 있다고 타입스크립트에게 알려 주는 문법
    // 원래 socket에는 user라는 속성이 없지만 authGuard에서 커스텀으로 정의 -> 사용하기 위해서 해당 문법 사용
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);
    if (!chatExists) {
      throw new WsException(`존재하지 않는 채팅방입니다: ${dto.chatId}`);
    }

    const message = await this.messagesService.createMessage(
      dto,
      socket.user.id,
    ); // 보낼 메세지 만들기
    if (!message) {
      throw new WsException(`존재하지 않는 메세지입니다: ${message}`);
    }

    // chatId room에 들어가 있는 소켓들에게 receive_message 이벤트를 보냄. (자신 포함)
    this.server
      .in(message.chat.id.toString())
      .emit('receive_message', message.message);

    // broadcasting: chatId room에 들어가 있는 소켓들에게 receive_message 이벤트를 보냄. (자신 제외)
    socket
      .to(message.chat.id.toString())
      .emit('receive_message', message.message);

    // 클라이언트에서 send_message 라는 함수를 호출한 후 메세지를 보내면 서버의 콘솔에 출력됨.
    console.log(message);
  }

  // 채팅방을 만드는 기능
  @UseFilters(SocketCatchHttpExceptionFilter) // http 에러 발생 시 알맞은 형식으로 변경해줌.
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = await this.chatsService.createChat(data);
  }
}
