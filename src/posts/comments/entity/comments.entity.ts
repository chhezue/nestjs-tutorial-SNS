import { IsNumber, IsString } from 'class-validator';
import { UsersModel } from 'src/users/entity/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { PostsModel } from '../../entity/posts.entity';

@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.postComments)
  author: UsersModel; // author = userModel 값으로 대체

  @Column()
  @IsString()
  comment: string;

  @Column()
  @IsNumber()
  likeCount: number;

  @Column({
    default: 0,
  })
  @IsNumber()
  commentCount: number;

  @ManyToOne(() => PostsModel, (post) => post.comments)
  post: PostsModel;
}
