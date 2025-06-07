import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { basename, join } from 'path';
import { QueryRunner, Repository } from 'typeorm';
import {
  POSTS_IMAGE_PATH,
  PUBLIC_FOLDER_PATH,
} from '../../common/const/path.const';
import { ImageModel } from '../../common/entity/image.entity';
import { CreateImageDto } from './dto/create-image.dto';

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(dto: CreateImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    // dto의 이미지 이름을 기반으로 파일의 경로를 생성한다.
    const tempFilePath = join(PUBLIC_FOLDER_PATH, dto.path);

    try {
      // 파일이 존재하는지 확인
      // 만약에 존재하지 않는다면 에러를 발생시킴.
      await promises.access(tempFilePath);
    } catch (error) {
      throw new BadRequestException('존재하지 않는 파일입니다.', error);
    }

    // 파일 이름만 가져오기
    const fileName = basename(tempFilePath);

    // 새로 이동할 포스트 폴더의 경로
    const newPath = join(POSTS_IMAGE_PATH, fileName);

    // save
    const result = await repository.save({ ...dto });

    // 파일 옮기기 (temp -> public)
    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
