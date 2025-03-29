import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { ShortUser } from '../../user/dto/user.dto';
import { TopicDto } from '../_modules/topic/dto/topic.dto';
import { Level } from '../_modules/level/entity/level.entity';
import { CategoryDto } from '../_modules/category/dto/category.dto';
import { CourseStatus } from '../model/course.model';
import { InstructorDto } from './instructor.dto';
import { Target } from '../_modules/target/entity/target.entity';
import { DiscountDto } from './discount.dto';
import { CourseSubscriptionDto } from '../_modules/payment/payment.dto';

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
  currency: string;

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

  @IsOptional()
  discounts?: DiscountDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  rating?: number;
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
  currency: string;

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
  status?: CourseStatus;

  content?: string;
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
  currency: string;

  @IsOptional()
  rating: number;

  @IsOptional()
  subCategory: CategoryDto;

  @IsOptional()
  level: Level;

  @IsOptional()
  topics: TopicDto[];

  @IsOptional()
  instructors: InstructorDto[];

  @IsOptional()
  discounts: DiscountDto[];

  @IsOptional()
  totalSection: number;

  @IsOptional()
  totalFile: number;

  @IsOptional()
  targets: Target[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class ProductPrice {
  @IsNumber()
  price: number;

  currency: string;

  discount: DiscountDto[];

  totalSection: number;

  totalFile: number;

  subscription: CourseSubscriptionDto;
}
