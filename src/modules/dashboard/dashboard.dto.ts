import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../common/enums/roles.enum';
import { ChartCoursePayload } from '../course/_modules/payment/payment.dto';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  birthDay?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsNotEmpty()
  roles: Role[];
}

export interface DashboardSubPayload extends ChartCoursePayload {
  userIds?: number[];
}
