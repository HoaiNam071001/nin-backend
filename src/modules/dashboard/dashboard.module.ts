import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { UserModule } from '../user/user.module';
import { UserRole } from '../user/entity/user-role.entity';
import { PaymentModule } from '../course/_modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, UserRole]),
    UserModule,
    PaymentModule,
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}
