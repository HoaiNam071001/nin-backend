import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { Course } from './entity/course.entity';
import { Category } from './entity/category.entity';
import { Level } from './entity/level.entity';
import { Topic } from './entity/topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Category, Level, Topic])],
  providers: [CourseService],
  controllers: [CourseController],
})
export class CourseModule {
  static TypeOrmModule: Course;
}
