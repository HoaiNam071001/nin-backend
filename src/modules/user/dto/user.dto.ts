import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entity/user-role.entity';

export class ShortUser {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  avatar: string;

  @Expose()
  fullName: string;

  @Exclude()
  phoneNumber?: string;

  @Exclude()
  birthDay?: Date;

  @Exclude()
  bio?: string;

  @Exclude()
  password: string;

  @Exclude()
  roles: UserRole[];

  @Exclude()
  @Expose()
  createdAt: Date;

  @Exclude()
  @Expose()
  updatedAt: Date;
}

export class UserDto {
  @Expose()
  id: number;

  @IsEmail()
  @Expose()
  email: string;

  @IsOptional()
  @IsString()
  @Expose()
  firstName?: string;

  @IsOptional()
  @IsString()
  @Expose()
  fullName?: string;

  @IsOptional()
  @IsString()
  @Expose()
  lastName?: string;

  @IsOptional()
  @IsString()
  @Expose()
  avatar?: string;

  @IsOptional()
  @IsString()
  @Expose()
  phoneNumber?: string;

  @IsOptional()
  @Expose()
  birthDay?: string;

  @IsOptional()
  @IsString()
  @Expose()
  bio?: string;

  @Exclude()
  password: string;

  @Exclude()
  @Expose()
  createdAt: Date;

  @Exclude()
  @Expose()
  updatedAt: Date;

  //

  @IsOptional()
  @Expose()
  roles?: UserRole[];
}

export class SearchUserPayload {}
