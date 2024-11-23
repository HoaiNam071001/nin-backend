import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/roles.enum';

// Tạo một decorator để gán vai trò yêu cầu
export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
