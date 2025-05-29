import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { POST_PUBLIC_IMAGE_PATH } from '../../common/const/path.const';
import { join } from 'path';
import { Transform } from 'class-transformer';

@Entity()
export class PostsModel extends BaseModel {
  // 1) foreign key를 이용해서 UserModel과 연결
  // 2) null 값이 될 수 없다.
  @ManyToOne(() => UsersModel, (user) => user.posts, { nullable: false })
  author: UsersModel; // author = userModel 값으로 대체

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({
    nullable: true,
  })
  // '스태틱 파일의 경로 + 파일 이름'까지 반환하도록 변경
  @Transform(({ value }) => value && `${join(POST_PUBLIC_IMAGE_PATH, value)}`)
  image?: string; // 이미지의 위치

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
