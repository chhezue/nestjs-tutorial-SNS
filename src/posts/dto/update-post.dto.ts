// import { CreatePostDto } from './create-post.dto';
// import { IsOptional, IsString } from 'class-validator';
// import { PartialType } from '@nestjs/mapped-types';
// import { StringValidationMessage } from '../../common/validation-message/string-validation.message';
//
// // Pick, Omit, Partial -> type 반환
// // PickType, OmitType, PartialType -> value 반환, 상속 가능
//
// export class UpdatePostDto extends PartialType(CreatePostDto) {
//   @IsString({
//     message: StringValidationMessage,
//   })
//   @IsOptional()
//   title?: string;
//
//   @IsString({
//     message: StringValidationMessage,
//   })
//   @IsOptional()
//   content?: string;
// }
