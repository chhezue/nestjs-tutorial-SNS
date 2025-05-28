import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel]), CommonModule, AuthModule, UsersModule],
  controllers: [PostsController],
  providers: [PostsService, AccessTokenGuard],
})
export class PostsModule {}
