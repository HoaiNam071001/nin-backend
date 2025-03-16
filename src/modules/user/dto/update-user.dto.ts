import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @Length(1, 15)
  phoneNumber?: string;

  @IsOptional()
  birthDay?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  bio?: string;
}
