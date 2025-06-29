import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entity/posts.entity';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString({
    each: true, // image 배열에 있는 모든 값을 string으로 검증
  })
  @IsOptional()
  images?: string[];
}
