import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from '../course/_modules/cart/cart.module';
import { CourseModule } from '../course/course.module';
import { Course } from '../course/entity/course.entity';
import { NotificationsModule } from '../user/modules/notifications/notifications.module';
import { MoMoPaymentService } from './_method/momo.service';
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
  providers: [PaymentService, MoMoPaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
