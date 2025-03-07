import { IsOptional } from 'class-validator';
import { CourseAccessType, InstructorType } from '../model/course.model';
import { ShortUser } from '../../user/dto/user.dto';
import { Exclude } from 'class-transformer';

export class InstructorDto {
  @IsOptional()
  user: ShortUser;

  @Exclude()
  userId?: number;

  @IsOptional()
  accessType: CourseAccessType;

  @IsOptional()
  type: InstructorType;

  @IsOptional()
  id: number;

  @IsOptional()
  createdAt: Date;

  @IsOptional()
  updatedAt: Date;
}

export class InstructorPayloadDto {
  userId: number;

  accessType: CourseAccessType;

  type: InstructorType;
}
