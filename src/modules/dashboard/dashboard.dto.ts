import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../common/enums/roles.enum';
import { ChartCoursePayload } from '../course/_modules/payment/payment.dto';
import { CourseStatus } from '../course/model/course.model';

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

export interface UserCount {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  role: { [key in Role]: number };
}

export interface CourseCount {
  totalCourses: number;
  status: { [key in CourseStatus]: number };
}

export interface DashboardReport {
  users: UserCount;
  courses: CourseCount;
}
