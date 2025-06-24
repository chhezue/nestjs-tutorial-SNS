import { IsNumber } from 'class-validator';

export class CreateChatDto {
  @IsNumber({}, { each: true })
  userIds: number[]; // 채팅방에 참여한 사용자들의 id
}
