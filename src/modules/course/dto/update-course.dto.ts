import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

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

  @IsOptional()
  @IsString()
  keynote?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
