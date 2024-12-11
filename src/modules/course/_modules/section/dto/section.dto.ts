import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
} from 'class-validator';
import { SectionType } from '../../../../../common/enums/roles.enum';
import { VideoDto } from '../../video/dto/video.dto';
import { PostDto } from '../../post/dto/post.dto';
import { FileDto } from '../../../../file/dto/file.dto';

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

export class SectionContentDto {
  @IsNumber()
  id: number;

  @IsEnum(SectionType)
  @IsOptional()
  type?: SectionType;

  video?: VideoDto;
  post?: PostDto;
  files: FileDto[];
}
