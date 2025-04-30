import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entity/course.entity';
import { PaymentModule } from '../payment/payment.module';
import { UserRole } from '../user/entity/user-role.entity';
import { User } from '../user/entity/user.entity';
import { UserModule } from '../user/user.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, UserRole, Course]),
    UserModule,
    PaymentModule,
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}
