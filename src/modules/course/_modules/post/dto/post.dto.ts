import { IsInt, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsInt()
  estimatedTime?: number;
}

export class PostDto {
  id: number;

  content?: string;

  @IsOptional()
  @IsInt()
  estimatedTime?: number;
}
