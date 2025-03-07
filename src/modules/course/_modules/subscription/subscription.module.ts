import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../../user/user.module';
import { CourseModule } from '../../course.module';
import { FileModule } from '../../../file/file.module';
import { CourseSubscriptionController } from './controller/subscription.controller';
import { CourseSubscriptionService } from './service/subscription.service';
import { CourseSubscription } from './entity/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseSubscription]),
    UserModule,
    FileModule,
    forwardRef(() => CourseModule),
  ],
  providers: [CourseSubscriptionService],
  controllers: [CourseSubscriptionController],
  exports: [CourseSubscriptionService],
})
export class CourseSubscriptionModule {
  static TypeOrmModule: CourseSubscription;
}
