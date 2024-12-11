import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsBoolean, IsString } from 'class-validator';

// DTO cho Topic
export class TopicDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsBoolean()
  isGlobal: boolean;

  @Exclude()
  @Expose()
  createdAt: Date;

  @Exclude()
  @Expose()
  updatedAt: Date;
}
