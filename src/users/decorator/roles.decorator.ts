import { SetMetadata } from '@nestjs/common';
import { ROLES } from '../const/roles.const.enum';

export const ROLES_KEY = 'user_roles';

// @Roles(Roles.ADMIN) 이라는 데코레이터로 불러와서 사용
export const Roles = (role: ROLES) => SetMetadata(ROLES_KEY, role);
