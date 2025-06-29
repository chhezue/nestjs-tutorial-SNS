import { Exclude } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { ChatsModel } from '../../chats/entity/chats.entity';
import { MessagesModel } from '../../chats/messages/entity/messages.entity';
import { CommentsModel } from '../../posts/comments/entity/comments.entity';
import { ROLES } from '../const/roles.const.enum';
import { PostsModel } from 'src/posts/entity/posts.entity';
import { BaseModel } from '../../common/entity/base.entity';

@Entity()
export class UsersModel extends BaseModel {
  @Column({ unique: true, length: 20 })
  nickname: string;

  @Column({ unique: true })
  @Exclude({
    toPlainOnly: true, // 응답으로 보낼 때만 비밀번호 보여주지 않음.
  })
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

  @OneToMany(() => CommentsModel, (comment) => comment.author)
  postComments: CommentsModel[];
}
