import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // AppModule을 시작으로 Module을 확장해 나간다는 의미
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // dto의 default 값들만으로도 인스턴스 생성 가능하도록 허용
      transformOptions: {
        enableImplicitConversion: true, // Type(() => Number) 사용하지 않아도 됨.
      },
      whitelist: true, // dto에 정의된 필드만 허용
      forbidNonWhitelisted: true, // dto에 정의된 필드만 허용하지 않으면 에러 발생
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
