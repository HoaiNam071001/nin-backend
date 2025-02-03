import { IsOptional, IsString } from 'class-validator';
import { CourseStatus } from '../../../common/enums/roles.enum';

export class CourseSearchFilterDto {
  @IsString()
  status?: CourseStatus | CourseStatus[];

  @IsOptional()
  categoryIds: number | number[];

  @IsOptional()
  levelIds?: number | number[];
}
