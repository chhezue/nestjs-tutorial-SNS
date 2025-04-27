import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ROLES } from '../const/roles.const.enum';
import { PostsModel } from 'src/posts/entities/posts.entity';

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

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
}
