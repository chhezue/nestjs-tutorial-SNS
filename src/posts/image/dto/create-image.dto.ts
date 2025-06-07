import { PickType } from '@nestjs/mapped-types';
import { ImageModel } from 'src/common/entity/image.entity';

export class CreateImageDto extends PickType(ImageModel, [
  'path',
  'posts',
  'order',
  'type',
]) {}
