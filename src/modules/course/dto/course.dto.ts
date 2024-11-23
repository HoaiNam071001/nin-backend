import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { CourseStatus } from '../../../common/enums/roles.enum';
import { Category } from '../entity/category.entity';
import { Level } from '../entity/level.entity';
import { Exclude, Expose } from 'class-transformer';
import { ShortUser } from '../../user/dto/user.dto';

export class CourseDto {
  @Expose()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  slug?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsOptional()
  @IsInt()
  estimatedTime?: number;

  @IsString()
  status?: CourseStatus;

  @IsOptional()
  owner?: ShortUser;

  @IsOptional()
  category?: Category;

  @IsOptional()
  subCategory?: Category;

  @IsOptional()
  level?: Level;

  @IsOptional()
  courseTopics?: CourseTopicDto[];

  @Exclude()
  @Expose()
  createdAt: Date;

  @Exclude()
  @Expose()
  updatedAt: Date;
}

export class CourseTopicDto {
  @Expose()
  id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
