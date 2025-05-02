import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchModule } from '../ai/search.module';
import { FileModule } from '../file/file.module';
import { PaymentModule } from '../payment/payment.module';
import { NotificationsModule } from '../user/modules/notifications/notifications.module';
import { UserModule } from '../user/user.module';
import { CartModule } from './_modules/cart/cart.module';
import { CategoryModule } from './_modules/category/category.module';
import { CourseCommentModule } from './_modules/comment/comment.module';
import { LevelModule } from './_modules/level/level.module';
import { PostModule } from './_modules/post/post.module';
import { CourseRatingModule } from './_modules/rating/course-rating.module';
import {
  Section,
  SectionProgress,
} from './_modules/section/entity/section.entity';
import { SectionModule } from './_modules/section/section.module';
import { TargetModule } from './_modules/target/target.module';
import { TopicModule } from './_modules/topic/topic.module';
import { VideoModule } from './_modules/video/video.module';
import { CourseProgressController } from './controller/course-progress.controller';
import { CourseSearchController } from './controller/course-search.controller';
import { CourseController } from './controller/course.controller';
import { RecentSearchesController } from './controller/recent-searches.controller';
import { Course, CourseProgress } from './entity/course.entity';
import { Discount } from './entity/discount.entity';
import { Instructor } from './entity/instructor.entity';
import { RecentSearch } from './entity/recent-searches.entity';
import { CourseProgressService } from './service/course-progress.service';
import { CourseSearchService } from './service/course-search.service';
import { CourseUpdateService } from './service/course-update.service';
import { CourseService } from './service/course.service';
import { InstructorService } from './service/instructor.service';
import { RecentSearchesService } from './service/recent-searches.service';

const SERVICES = [
  CourseService,
  CourseUpdateService,
  CourseSearchService,
  InstructorService,
  RecentSearchesService,
  CourseProgressService,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Instructor,
      Discount,
      RecentSearch,
      CourseProgress,
      Section,
      SectionProgress,
    ]),
    UserModule,
    LevelModule,
    CategoryModule,
    TopicModule,
    forwardRef(() => SectionModule),
    PostModule,
    VideoModule,
    TargetModule,
    SearchModule,
    FileModule,
    forwardRef(() => PaymentModule),
    CourseCommentModule,
    CourseRatingModule,
    forwardRef(() => NotificationsModule),
    forwardRef(() => CartModule),
  ],
  providers: [...SERVICES],
  controllers: [
    CourseController,
    CourseSearchController,
    RecentSearchesController,
    CourseProgressController,
  ],
  exports: [...SERVICES],
})
export class CourseModule {
  static TypeOrmModule: Course;
}
