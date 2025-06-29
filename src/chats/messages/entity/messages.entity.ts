import { IsString } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { UsersModel } from '../../../users/entity/users.entity';
import { ChatsModel } from '../../entity/chats.entity';

@Entity()
export class MessagesModel extends BaseModel {
  @ManyToOne(() => ChatsModel, (chat) => chat.messages)
  chat: ChatsModel; // 채팅방

  @ManyToOne(() => UsersModel, (user) => user.messages)
  author: UsersModel; // 채팅 보낸 사람(사용자)

  @Column()
  @IsString()
  message: string; // 실제 메세지의 내용
}
