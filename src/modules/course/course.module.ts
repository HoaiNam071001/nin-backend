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
import { TargetModule } from './_modules/target/target.module';
import { CourseSearchController } from './controller/course-search.controller';
import { CourseSearchService } from './service/course-search.service';

const SERVICES = [CourseService, CourseUpdateService, CourseSearchService];

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
    TargetModule,
  ],
  providers: [...SERVICES],
  controllers: [CourseController, CourseSearchController],
  exports: [...SERVICES],
})
export class CourseModule {
  static TypeOrmModule: Course;
}
