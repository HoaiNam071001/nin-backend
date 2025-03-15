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
import { InstructorService } from './service/instructor.service';
import { Instructor } from './entity/instructor.entity';
import { SearchModule } from '../ai/search.module';
import { Discount } from './entity/discount.entity';
import { FileModule } from '../file/file.module';
import { PaymentModule } from './_modules/payment/payment.module';
import { CartModule } from './_modules/cart/cart.module';
import { CourseCommentModule } from './_modules/comment/comment.module';

const SERVICES = [
  CourseService,
  CourseUpdateService,
  CourseSearchService,
  InstructorService,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Instructor, Discount]),
    UserModule,
    LevelModule,
    CategoryModule,
    TopicModule,
    forwardRef(() => SectionModule),
    PostModule,
    VideoModule,
    TargetModule,
    PaymentModule,
    SearchModule,
    FileModule,
    CartModule,
    forwardRef(() => PaymentModule),
    CourseCommentModule,
  ],
  providers: [...SERVICES],
  controllers: [CourseController, CourseSearchController],
  exports: [...SERVICES],
})
export class CourseModule {
  static TypeOrmModule: Course;
}
