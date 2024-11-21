import { SetMetadata } from '@nestjs/common';

// Tạo một decorator để gán vai trò yêu cầu
export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
