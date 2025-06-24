import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../../common/common.module';
import { MessagesModel } from './entity/messages.entity';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessagesModel]), // ✅ 추가
    CommonModule, // ✅ CommonService 주입용
  ],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
