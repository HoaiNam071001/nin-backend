import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from '../../../payment/payment.module';
import { CartController } from './cart.controller';
import { CartItem } from './cart.entity';
import { CartService } from './cart.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    forwardRef(() => PaymentModule),
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}
