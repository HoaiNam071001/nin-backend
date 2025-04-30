import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { FileDto } from '../../../../file/dto/file.dto';
import { PostDto } from '../../post/dto/post.dto';
import { VideoDto } from '../../video/dto/video.dto';
import { SectionType } from '../model/section.model';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  estimatedTime?: number;

  @IsEnum(SectionType)
  @IsOptional()
  type?: SectionType;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  estimatedTime?: number;

  @IsEnum(SectionType)
  @IsOptional()
  type?: SectionType;
}

export class SectionDto {
  id: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  estimatedTime?: number;

  @IsEnum(SectionType)
  @IsOptional()
  type?: SectionType;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}

export class SectionContentDto extends SectionDto {
  @IsNumber()
  id: number;

  @IsEnum(SectionType)
  @IsOptional()
  type?: SectionType;

  video?: VideoDto;
  post?: PostDto;
  files: FileDto[];
}
