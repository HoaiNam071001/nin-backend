import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class CategoryDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  parentCategory?: CategoryDto;

  @Exclude()
  @Expose()
  createdAt: Date;

  @Exclude()
  @Expose()
  updatedAt: Date;
}
