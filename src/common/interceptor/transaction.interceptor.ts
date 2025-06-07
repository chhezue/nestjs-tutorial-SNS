import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    req.queryRunner = qr;

    return next.handle().pipe(
      catchError(async (e) => {
        // 트랜잭션 에러가 발생한 경우
        await qr.rollbackTransaction();
        await qr.release();
        throw new InternalServerErrorException(
          '트랜잭션 과정에서 에러 발생:',
          e,
        );
      }),
      tap(async () => {
        // 모든 작업이 성공적으로 완료된 경우
        await qr.commitTransaction();
        await qr.release();
      }),
    );
  }
}
