import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // 요청이 들어올 때: [REQ] {요청 path} {요청 시간}
    // 요청이 끝날 때: [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms}

    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;
    const now = Date.now();

    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    // -------- 요청이 끝난 후 실행되는 부분 --------
    // return next.handle() 을 실행하는 순간 라우트의 로직이 전부 실행되고 응답이 반환된다.
    return next
      .handle() // observable 반환
      .pipe(
        // handle() 에서 반환된 observable
        tap((observable) =>
          console.log(
            `[RES] ${path} ${now.toLocaleString('kr')} ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
