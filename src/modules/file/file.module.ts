import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFile } from './entity/file.entity';
import { DataModule } from '../data/data.module';

@Module({
  imports: [TypeOrmModule.forFeature([NFile]), DataModule],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
