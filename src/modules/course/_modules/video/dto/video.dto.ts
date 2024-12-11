import { IsOptional, IsInt } from 'class-validator';
import { FileDto } from '../../../../file/dto/file.dto';
import { Exclude } from 'class-transformer';

export class VideoDto {
  id: number;

  file?: FileDto;

  @Exclude()
  sectionId: number;

  @IsOptional()
  @IsInt()
  duration?: number;
}
