import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import {
  CourseSubscription,
  PaymentDetail,
  PaymentTransaction,
} from './payment.entity';
import { CourseModule } from '../../course.module';
import { CartModule } from '../cart/cart.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentTransaction,
      CourseSubscription,
      PaymentDetail,
    ]),
    forwardRef(() => CourseModule),
    forwardRef(() => CartModule),
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
