import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../modules/user/user.service';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles) {
      return true; // Nếu không có vai trò, cho phép truy cập
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Giả sử bạn đã xác thực người dùng và lưu thông tin vào request.user

    // Lấy vai trò của người dùng từ DB
    const userRoles = await this.userService.getUserRoles(user.id); // Hàm này cần được định nghĩa trong UserService

    // Kiểm tra xem người dùng có vai trò cần thiết hay không
    const hasRole = () =>
      userRoles.some((role) => roles.includes(role.roleName));
    if (!hasRole()) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true; // Nếu có quyền, cho phép truy cập
  }
}
