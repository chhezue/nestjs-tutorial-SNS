import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { ChatsModel } from '../../chats/entity/chats.entity';
import { MessagesModel } from '../../chats/messages/entity/messages.entity';
import { ROLES } from '../const/roles.const.enum';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from '../../common/entity/base.entity';

@Entity()
export class UsersModel extends BaseModel {
  @Column({ unique: true, length: 20 })
  nickname: string;

  @Column({ unique: true })
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ enum: Object.values(ROLES), default: ROLES.USER })
  role: ROLES;

  // user entity에서는 posts라는 PostModel 배열로 참조
  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel[];
}
