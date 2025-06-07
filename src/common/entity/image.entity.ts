import { BaseModel } from './base.entity';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PostsModel } from '../../posts/entities/posts.entity';
import { join } from 'path';
import { Transform } from 'class-transformer';
import { POST_PUBLIC_IMAGE_PATH } from '../const/path.const';

export enum ImageModelType {
  POST_IMAGE,
}

@Entity()
export class ImageModel extends BaseModel {
  // 사용자가 여러 개의 이미지를 올릴 때 그 순서
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number;

  // UserModel: 사용자 프로필 이미지
  // PostModel: 게시글 이미지
  @Column({
    enum: ImageModelType,
  })
  @IsEnum(ImageModelType)
  @IsString()
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImageModelType.POST_IMAGE) {
      return `/${join(POST_PUBLIC_IMAGE_PATH, value || '')}`;
    }
    return value;
  })
  path: string;

  @ManyToOne(() => PostsModel, (post) => post.images)
  posts?: PostsModel;
}
