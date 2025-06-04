import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { POSTS_IMAGE_PATH } from './const/path.const';

@Module({
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
  imports: [
    AuthModule,
    UsersModule,
    MulterModule.register({
      // 제한 요소 등록
      limits: { fileSize: 1000000 },

      /**
       callback(error, boolean)
       - error: 에러가 있을 경우 에러 정보
       - file: 파일을 받을지 말지 여부
       */
      fileFilter(req, file, callback) {
        const ext = extname(file.originalname); // 확장자만 가져옴.
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
          return callback(
            new BadRequestException('jpg, jpeg, png 파일만 업로드 가능합니다.'),
            false,
          );
        }
        callback(null, true); // 파일 다운로드 진행
      },

      storage: multer.diskStorage({
        // 파일을 저장할 위치
        destination: function (req, file, callback) {
          callback(null, POSTS_IMAGE_PATH);
        },

        // 저장되는 파일의 이름
        filename: function (req, file, callback) {
          callback(null, `${uuid()}${extname(file.originalname)}`); // 1234-1234-1234-1234.jpg 형태
        },
      }),
    }),
  ],
})
export class CommonModule {}
