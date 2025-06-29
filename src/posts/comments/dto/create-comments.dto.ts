import { PickType } from '@nestjs/mapped-types';
import { CommentsModel } from '../entity/comments.entity';

// CommentsModel에서 comment 속성만 가져와서 dto 생성
export class CreateCommentsDto extends PickType(CommentsModel, ['comment']) {}
