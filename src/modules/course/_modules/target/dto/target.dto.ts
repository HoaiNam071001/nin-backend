import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';
import { CourseTarget } from '../../../../../common/enums/course.enum';

export class TargetDto {
  @Expose()
  @IsInt()
  id?: number;

  @Expose()
  @IsString()
  content: string;

  @Expose()
  type: CourseTarget;

  @Exclude()
  @Expose()
  createdAt: Date;

  @Exclude()
  @Expose()
  updatedAt: Date;
}
