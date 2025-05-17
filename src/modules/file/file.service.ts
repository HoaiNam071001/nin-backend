import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { In, Repository } from 'typeorm';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto';
import { DataService } from '../data/services/data.service';
import { FileDto, FilePayloadDto, FileSearchPayload } from './dto/file.dto';
import { NFile } from './entity/file.entity';

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

  async countByCourse(courseId: number): Promise<number> {
    const count = await this.fileRepository.count({
      where: { courseId },
    });
    return count;
  }

  async find(
    pagable: PagingRequestBase,
    payload: FileSearchPayload,
  ): Promise<PaginationResponseDto<NFile>> {
    const where: any = {};

    if (payload.userIds && payload.userIds.length > 0) {
      where.userId = In(payload.userIds);
    }

    if (payload.courseIds && payload.courseIds.length > 0) {
      where.courseId = In(payload.courseIds);
    }

    const query = new PagingRequestDto<NFile>(pagable, []).mapOrmQuery({
      where,
      relations: ['user', 'course'],
    });
    const [data, total] = await this.fileRepository.findAndCount(query);

    return new PaginationResponseDto<NFile>(
      data,
      total,
      pagable.page,
      pagable.size,
    );
  }
}
