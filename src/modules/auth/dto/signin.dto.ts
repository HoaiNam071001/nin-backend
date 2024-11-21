import { IsEmail, IsNotEmpty } from 'class-validator';

export class SigninDto {
  @IsEmail() // Kiểm tra xem đây có phải là email hợp lệ không
  @IsNotEmpty() // Kiểm tra xem trường không được để trống
  email: string;

  @IsNotEmpty() // Kiểm tra xem trường không được để trống
  password: string;
}
