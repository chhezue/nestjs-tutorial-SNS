import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class BasePaginationDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID보다 높은 ID부터 값을 가져옴.
  @IsOptional()
  @IsNumber()
  where__id__more_than?: number;

  // 정렬이 desc인 경우
  @IsOptional()
  @IsNumber()
  where__id__less_than?: number;

  // 정렬: 생성된 시간의 내림차/오름차순으로 정렬
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt: 'ASC' | 'DESC' = 'ASC';

  // 몇 개의 데이터를 응답으로 받을지
  @IsNumber()
  @IsOptional()
  take: number = 20;
}
