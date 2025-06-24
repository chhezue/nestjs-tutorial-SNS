import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsModel } from './entity/chats.entity';
import { MessagesController } from './messages/messages.controller';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatsModel]),
    CommonModule,
    MessagesModule,
  ],
  controllers: [ChatsController, MessagesController],
  providers: [ChatsService, ChatsGateway],
})
export class ChatsModule {}
