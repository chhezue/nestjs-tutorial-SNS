import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private usersRepository: Repository<UsersModel>,
  ) {}

  // 사용자 생성
  async createUser(
    user: Pick<UsersModel, 'nickname' | 'password' | 'email'>,
  ): Promise<UsersModel> {
    // 1) 닉네임 중복 체크
    // exist(): 조건에 해당되는 값이 있으면 true 반환
    const nicknameExist = await this.usersRepository.exist({
      where: { nickname: user.nickname },
    });

    if (nicknameExist) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    // 2) 이메일 중복 체크
    const emailExist = await this.usersRepository.exist({
      where: { email: user.email },
    });

    if (emailExist) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      password: user.password,
      email: user.email,
    });
    const newUser = await this.usersRepository.save(userObject);
    return newUser;
  }

  // 모든 사용자 가져오기
  async getAllUsers(): Promise<UsersModel[]> {
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }
}
