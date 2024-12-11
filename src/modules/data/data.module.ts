import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Đảm bảo ConfigModule được import
  providers: [DataService],
  controllers: [DataController],
  exports: [DataService],
})
export class DataModule {}
