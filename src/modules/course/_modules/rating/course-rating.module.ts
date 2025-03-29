import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseRating } from './course-rating.entity';
import { CourseRatingService } from './course-rating.service';
import { CourseRatingController } from './course-rating.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseRating])],
  providers: [CourseRatingService],
  controllers: [CourseRatingController],
})
export class CourseRatingModule {}
