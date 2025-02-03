import { UserDto } from '../../user/dto/user.dto';

export class AuthResponseDto {
  token: string;
  user: UserDto;
}
