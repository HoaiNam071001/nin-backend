import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  UseGuards,
  Req,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../../common/interfaces';
import { Role } from '../../common/enums/roles.enum';
import { User } from './entity/user.entity';
import { UpdateRoleDto } from './dto/role.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @Post('roles')
  addRoleForYourSelf(
    @Req() { user }: AuthRequest,
    @Body() request: UpdateRoleDto,
  ) {
    const validateRoleAddition = (user: User, role: Role): void => {
      const restrictedRoles = [Role.EDUCATION_MANAGER, Role.ADMIN];
      const isAdmin = user?.roles?.some((e) => e.roleName === Role.ADMIN);

      if (restrictedRoles.includes(role) && !isAdmin) {
        throw new ForbiddenException('Only admin can add roles');
      }
    };
    validateRoleAddition(user, request?.role);

    return this.usersService.addRoleToUser(user.id, request.role);
  }

  // @Get()
  // findAll(): Promise<User[]> {
  //   return this.usersService.findAll();
  // }

  @Get('profile')
  findCurrent(@Req() { user }: AuthRequest) {
    return user;
  }

  @Post(':id')
  updateOne(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
