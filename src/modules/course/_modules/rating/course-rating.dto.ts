import { IsInt, IsString, Min, Max, IsOptional } from 'class-validator';

export class CreateCourseRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  content?: string;
}

export class UpdateCourseRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  content?: string;
}

export class CourseRatingFilterDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}

export interface RatingStats {
  averageRating: number;
  ratingCounts: { [key: number]: number };
  ratingPercentages: { [key: number]: number };
  totalRatings: number;
}
