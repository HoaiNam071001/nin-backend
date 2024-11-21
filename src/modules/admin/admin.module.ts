import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [AuthModule, UserModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
