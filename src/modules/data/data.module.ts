import { Module } from '@nestjs/common';
import { DataService } from './services/data.service';
import { DataController } from './data.controller';
import { ConfigModule } from '@nestjs/config';
import { BaseService } from './services/base.service';

@Module({
  imports: [ConfigModule], // Đảm bảo ConfigModule được import
  providers: [DataService, BaseService],
  controllers: [DataController],
  exports: [DataService, BaseService],
})
export class DataModule {}
