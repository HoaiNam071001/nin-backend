import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { Expose } from 'class-transformer';
import { ShortUser } from '../../user/dto/user.dto';
import { TopicDto } from '../_modules/topic/dto/topic.dto';
import { Level } from '../_modules/level/entity/level.entity';
import { CategoryDto } from '../_modules/category/dto/category.dto';
import { CourseStatus } from '../model/course.model';
import { InstructorDto } from './instructor.dto';
import { Target } from '../_modules/target/entity/target.entity';

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
  @IsString()
  summary?: string;

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
  category?: CategoryDto;

  @IsOptional()
  subCategory?: CategoryDto;

  @IsOptional()
  level?: Level;

  @IsOptional()
  topics?: TopicDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class CoursePayloadDto {
  @Expose()
  @IsOptional()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  slug?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsOptional()
  @IsInt()
  estimatedTime?: number;

  @IsOptional()
  @IsString()
  status?: CourseStatus;

  @IsOptional()
  ownerId?: number;

  @IsOptional()
  categoryId: number;

  @IsOptional()
  subCategoryId?: number;

  @IsOptional()
  levelId?: number;

  @IsOptional()
  topicIds?: number[];
}

export class CourseStatusPayloadDto {
  @IsString()
  status?: CourseStatus;
}

export class FullCourseDto {
  @Expose()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  slug: string;

  @IsOptional()
  @IsString()
  thumbnail: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  summary: string;

  @IsOptional()
  @IsInt()
  price: number;

  @IsOptional()
  @IsInt()
  estimatedTime: number;

  @IsString()
  status: CourseStatus;

  @IsOptional()
  owner: ShortUser;

  @IsOptional()
  category: CategoryDto;

  @IsOptional()
  subCategory: CategoryDto;

  @IsOptional()
  level: Level;

  @IsOptional()
  topics: TopicDto[];

  @IsOptional()
  instructors: InstructorDto[];

  @IsOptional()
  targets: Target[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
