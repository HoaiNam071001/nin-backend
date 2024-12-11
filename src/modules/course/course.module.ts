import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './service/course.service';
import { CourseController } from './controller/course.controller';
import { Course } from './entity/course.entity';
import { CourseUpdateService } from './service/course-update.service';
import { UserModule } from '../user/user.module';
import { LevelModule } from './_modules/level/level.module';
import { CategoryModule } from './_modules/category/category.module';
import { TopicModule } from './_modules/topic/topic.module';
import { SectionModule } from './_modules/section/section.module';
import { PostModule } from './_modules/post/post.module';
import { VideoModule } from './_modules/video/video.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    UserModule,
    LevelModule,
    CategoryModule,
    TopicModule,
    forwardRef(() => SectionModule),
    PostModule,
    VideoModule,
  ],
  providers: [CourseService, CourseUpdateService],
  controllers: [CourseController],
  exports: [CourseService, CourseUpdateService], // Export the services so they can be used in other modules
})
export class CourseModule {
  static TypeOrmModule: Course;
}
