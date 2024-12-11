import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../entity/video.entity';
import { User } from '../../../../user/entity/user.entity';
import { SystemFileType } from '../../../../data/models';
import { FileService } from '../../../../file/file.service';
import { FileDto } from '../../../../file/dto/file.dto';
import { SectionService } from '../../section/service/section.service';
import { plainToClass } from 'class-transformer';
import { VideoDto } from '../dto/video.dto';

@Injectable()
export class VideoService {
  constructor(
    private fileService: FileService,
    private sectionService: SectionService,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  async updateBySection(
    sectionId: number,
    file: Express.Multer.File,
    user: User,
  ): Promise<VideoDto> {
    try {
      const section = await this.sectionService.findOneFullData(sectionId);
      if (!section) {
        throw new NotFoundException(`Section not found`);
      }
      const type = SystemFileType.VIDEO_CONTENT;
      const savedFile: FileDto = await this.fileService.create(file, {
        systemType: type,
        userId: user.id,
        courseId: section.courseId,
        sectionId,
      });

      const video = await this.findBySection(sectionId);

      if (video) {
        video.file = savedFile;
        await this.videoRepository.save(video);
        return plainToClass(VideoDto, video);
      }

      const newVideo = this.videoRepository.create({
        file: savedFile,
        sectionId,
      });
      await this.videoRepository.save(newVideo);
      return await this.findBySection(sectionId);
    } catch (err) {
      throw new Error(`Error uploading file ${err}`);
    }
  }

  async remove(id: number) {
    const video = await this.videoRepository.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException(`Video not found`);
    }
    video.file = null;
    return plainToClass(VideoDto, await this.videoRepository.save(video));
  }

  async findBySection(sectionId: number): Promise<VideoDto> {
    const section = await this.videoRepository.findOne({
      where: { sectionId },
      relations: ['file'],
    });
    return plainToClass(VideoDto, section);
  }
}
