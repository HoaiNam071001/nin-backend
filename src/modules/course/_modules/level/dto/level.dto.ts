import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class LevelDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Exclude()
  @Expose()
  createdAt: Date;

  @Exclude()
  @Expose()
  updatedAt: Date;
}
