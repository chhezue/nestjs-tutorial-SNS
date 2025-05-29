import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { PostsModel } from './posts/entities/posts.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './common/const/env-keys.const';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';

@Module({
  imports: [
    PostsModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true, // 어디에서든 사용 가능함.
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // 데이터베이스 타입
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_DB_PORT_KEY] ?? '5432'),
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      entities: [PostsModel, UsersModel],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public', // 요청 경로의 prefix에 'public' 추가
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
