import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/enums/roles.enum';

@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard) // Sử dụng guard JWT và RolesGuard
  @Roles(Role.ADMIN) // Gán vai trò yêu cầu là 'admin'
  getAdminDashboard() {
    return 'Welcome to the admin dashboard!';
  }
}
