import { IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/enums/roles.enum';

export class UpdateRoleDto {
  @IsNotEmpty() // Kiểm tra xem trường không được để trống
  role?: Role;
}

export class UpdateRolesDto {
  @IsNotEmpty()
  roles: Role[];
}
