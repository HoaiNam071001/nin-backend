import { User } from '../../user/entity/user.entity';

export class AuthResponseDto {
  token: string;
  user: User;
}
