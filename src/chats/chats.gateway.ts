import { UsePipes, ValidationPipe } from '@nestjs/common';
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
  ) {}

  @WebSocketServer()
  server: Server; // 서버 객체(IO 생성)

  handleConnection(socket: Socket): any {
    console.log(`on connect called: ${socket.id}`);
  }

  // join(): room에 들어간다는 의미
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
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);
    if (!chatExists) {
      throw new WsException(`존재하지 않는 채팅방입니다: ${dto.chatId}`);
    }

    const message = await this.messagesService.createMessage(dto); // 보낼 메세지 만들기
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
  @UsePipes(
    new ValidationPipe({
      transform: true, // dto의 default 값들만으로도 인스턴스 생성 가능하도록 허용
      transformOptions: {
        enableImplicitConversion: true, // Type(() => Number) 사용하지 않아도 됨.
      },
      whitelist: true, // dto에 정의된 필드만 허용
      forbidNonWhitelisted: true, // dto에 정의된 필드만 허용하지 않으면 http 에러 발생
    }),
  )
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = await this.chatsService.createChat(data);
  }
}
