import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { CourseStatus } from '../../../common/enums/roles.enum';
import { Exclude, Expose } from 'class-transformer';
import { ShortUser } from '../../user/dto/user.dto';
import { TopicDto } from '../_modules/topic/dto/topic.dto';
import { Level } from '../_modules/level/entity/level.entity';
import { CategoryDto } from '../_modules/category/dto/category.dto';

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

  @Exclude()
  @Expose()
  createdAt: Date;

  @Exclude()
  @Expose()
  updatedAt: Date;
}

export class CoursePayloadDto {
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
