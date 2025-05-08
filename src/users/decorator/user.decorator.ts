import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersModel } from '../entities/users.entity';

// Guard의 Request에 들어 있는 UserModel을 반환하는 Custom Decorator
// data: 선택적인 매개변수로, 요청된 user 객체의 특정 속성을 추출하여 반환
export const User = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user as UsersModel;

    if (!user) {
      // 서버에서 에러가 발생했다고 알림. (ex. 가드를 사용하지 않은 경우)
      throw new InternalServerErrorException(
        'User Decorator는 AccessTokenGuard와 함께 사용해야 합니다.',
      );
    }

    // data가 제공되지 않으면: 전체 user 객체를 반환합니다. 즉, user 객체 전체가 함수의 파라미터로 전달됩니다.
    // data가 제공되면: user 객체에서 해당 data 속성만 반환합니다. 예를 들어, data가 'id'라면, user.id를 반환하게 됩니다.
    if (data) {
      return user[data];
    }

    return user;
  },
);
