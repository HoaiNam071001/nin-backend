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
  Query,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../../common/interfaces';
import { Role } from '../../common/enums/roles.enum';
import { User } from './entity/user.entity';
import { UpdateRoleDto } from './dto/role.dto';
import { PagingRequestDto } from '../../common/dto/pagination-request.dto';
import { SearchUserPayload, ShortUser } from './dto/user.dto';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @UseGuards(JwtAuthGuard)
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

  @Get('search')
  findAll(
    @Query() paging: PagingRequestDto<User>,
    @Query() filtersDto: SearchUserPayload,
  ): Promise<PaginationResponseDto<ShortUser>> {
    return this.usersService.find(paging, filtersDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  findCurrent(@Req() { user }: AuthRequest) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  updateOne(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() payload: UpdateUserDto) {
    return this.usersService.update(id, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
