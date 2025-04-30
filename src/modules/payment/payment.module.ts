import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import {
  CourseSubscription,
  PaymentDetail,
  PaymentTransaction,
} from './payment.entity';
import { PaymentService } from './payment.service';
import { CourseModule } from '../course/course.module';
import { NotificationsModule } from '../user/modules/notifications/notifications.module';
import { CartModule } from '../course/_modules/cart/cart.module';
import { Course } from '../course/entity/course.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentTransaction,
      CourseSubscription,
      PaymentDetail,
      Course,
    ]),
    forwardRef(() => CourseModule),
    forwardRef(() => CartModule),
    forwardRef(() => NotificationsModule),
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
