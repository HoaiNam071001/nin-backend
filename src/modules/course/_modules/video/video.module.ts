import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entity/video.entity';
import { VideoService } from './service/video.service';
import { VideoController } from './controller/video.controller';
import { SectionModule } from '../section/section.module';
import { FileModule } from '../../../file/file.module';
@Module({
  imports: [TypeOrmModule.forFeature([Video]), SectionModule, FileModule],
  providers: [VideoService],
  controllers: [VideoController],
})
export class VideoModule {
  static TypeOrmModule: Video;
}
