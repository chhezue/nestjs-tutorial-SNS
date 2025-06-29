import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import {
  ENV_HASH_ROUNDS_KEY,
  ENV_JWT_SECRET_KEY,
} from '../common/const/env-keys.const';

/**
 * [만들려는 기능]
 *
 * 1) registerWithEmail
 * - email, nickname, password를 입력받아 사용자 생성
 * - 생성이 완료되면 accessToken과 refreshToken을 반환
 *
 * 2) loginWithEmail
 * - email, password를 입력받아 사용자 검증
 * - 검증이 완료되면 accessToken과 refreshToken을 반환
 *
 * 3) loginUser
 * - (1)과 (2)에서 필요한 accessToken과 refreshToken을 반환
 *
 * 4) signToken
 * - (3)에서 필요한 accessToken과 refreshToken을 sign(생성)하는 로직
 *
 * 5) authenticateWithEmailAndPassword
 * - (2)에서 로그인을 진행할 때 필요한 기본적인 검증 진행
 * - ex) email로 사용자가 존재하는지 확인 & 비밀번호가 맞는지 확인(hash 처리)
 * - 모두 통과되면 찾은 사용자 정보 반환
 * - 사용자가 반환되면 그 데이터를 기반으로 (2)에서 토큰 발행
 */

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * [Payload에 들어갈 정보]
   * 1) email
   * 2) sub: 사용자의 id
   * 3) type: 'access' || 'refresh'
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    // 1. email로 사용자가 존재하는지 확인
    const exsitingUser = await this.usersService.getUserByEmail(user.email);

    if (!exsitingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    // 2. 비밀번호가 맞는지 확인(hash 처리)
    // parameter: inputed password, hashed password in database
    const passOk = await bcrypt.compare(user.password, exsitingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 3. 모두 통과되면 찾은 사용자 정보 반환
    return exsitingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const exsitingUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(exsitingUser); // accessToken과 refreshToken 반환
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ) {
    const hash = await bcrypt.hash(
      user.password,
      this.configService.get<number>(ENV_HASH_ROUNDS_KEY),
    );
    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });
    return this.loginUser(newUser); // accessToken과 refreshToken 반환
  }

  extreactTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' '); // ['Bearer', 'token']
    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('토큰 형식이 올바르지 않습니다.');
    }

    return splitToken[1];
  }

  decodedBasicToken(token: string) {
    const decoded = Buffer.from(token, 'base64').toString('utf-8'); // base64로 인코딩된 형태를 utf-8로 디코딩
    const split = decoded.split(':'); // ['email', 'password']

    if (split.length !== 2) {
      throw new UnauthorizedException('토큰 형식이 올바르지 않습니다.');
    }

    return { email: split[0], password: split[1] };
  }

  // 토큰 검증(payload 반환)
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
      });
    } catch (e) {
      throw new UnauthorizedException('만료된 토큰이거나 잘못된 토큰입니다.');
    }
  }

  // 토큰 갱신
  rotateToken(token: string, isRefreshToken: boolean) {
    // 현재 발급받으려는 토큰이 리프레시 토큰인지 확인
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>(ENV_JWT_SECRET_KEY),
    }); // 검증이 완료되면 payload 반환

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 리프레시 토큰으로만 가능합니다.',
      );
    }

    return this.signToken(decoded, isRefreshToken);
  }
}
