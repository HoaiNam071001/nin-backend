import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../../../user/modules/notifications/notifications.module';
import { CourseModule } from '../../course.module';
import { Course } from '../../entity/course.entity';
import { CartModule } from '../cart/cart.module';
import { PaymentController } from './payment.controller';
import {
  CourseSubscription,
  PaymentDetail,
  PaymentTransaction,
} from './payment.entity';
import { PaymentService } from './payment.service';
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
