import { Controller, Get } from '@nestjs/common';
import { ROLES } from './const/roles.const.enum';
import { Roles } from './decorator/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(ROLES.ADMIN)
  getUsers() {
    return this.usersService.getAllUsers();
  }
}
