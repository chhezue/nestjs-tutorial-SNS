import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class PasswordPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length > 8) {
      throw new BadRequestException('비밀번호는 8자 이하로 입력해주세요.');
    }
    return value.toString(); // 8자 이하일 경우 문자열로 변환하여 반환
  }
}

@Injectable()
export class MaxLengthPipe implements PipeTransform {
  constructor(private readonly length: number) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length > this.length) {
      throw new BadRequestException(`최대 길이는 ${this.length}입니다.`);
    }
    return value.toString();
  }
}

@Injectable()
export class MinLengthPipe implements PipeTransform {
  constructor(private readonly length: number) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length < this.length) {
      throw new BadRequestException(`최소 길이는 ${this.length}입니다.`);
    }
    return value.toString();
  }
}
