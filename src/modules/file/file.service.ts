import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFile } from './entity/file.entity';
import { FileDto, FilePayloadDto } from './dto/file.dto';
import { DataService } from '../data/data.service';
import { plainToClass } from 'class-transformer';

@Injectable()
export class FileService {
  constructor(
    private dataService: DataService,
    @InjectRepository(NFile)
    private fileRepository: Repository<NFile>,
  ) {}

  async create(
    file: Express.Multer.File,
    payload: FilePayloadDto,
  ): Promise<FileDto> {
    try {
      const { url } = await this.dataService.uploadFile(
        file,
        payload.systemType,
      );
      const createdFile = this.fileRepository.create({
        url,
        userId: payload.userId,
        type: file.mimetype,
        name: file.originalname,
        systemType: payload.systemType,
        size: +file.size,
        sectionId: payload.sectionId,
        courseId: payload.courseId,
      });

      await this.fileRepository.save(createdFile);
      return plainToClass(FileDto, createdFile);
    } catch (err) {
      throw new Error(`Error uploading file ${err}`);
    }
  }

  async findAll(): Promise<NFile[]> {
    return this.fileRepository.find();
  }

  async findById(id: number): Promise<NFile> {
    return this.fileRepository.findOne({ where: { id } });
  }

  async update(id: number, fileData: Partial<NFile>): Promise<NFile> {
    await this.fileRepository.update(id, fileData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.fileRepository.delete(id);
  }

  async findBySection(sectionId: number): Promise<FileDto> {
    const section = await this.fileRepository.findOne({
      where: { sectionId },
    });
    return plainToClass(FileDto, section);
  }
}
