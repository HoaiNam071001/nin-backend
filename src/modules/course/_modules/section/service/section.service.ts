import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { IsNull, Not, Repository } from 'typeorm';
import { SystemFileType } from '../../../../data/models';
import { FileDto } from '../../../../file/dto/file.dto';
import { FileService } from '../../../../file/file.service';
import { User } from '../../../../user/entity/user.entity';
import { CourseService } from '../../../service/course.service';
import {
  CreateSectionDto,
  SectionContentDto,
  SectionDto,
  UpdateSectionDto,
} from '../dto/section.dto';
import { Section } from '../entity/section.entity';

@Injectable()
export class SectionService {
  constructor(
    private fileService: FileService,
    private courseService: CourseService,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async create(
    createSectionDto: CreateSectionDto,
    user: User,
  ): Promise<SectionDto> {
    try {
      const { courseId, parentId, ...sectionData } = createSectionDto;

      // Validate course existence
      const course = await this.courseService.findOne(courseId);

      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }
      if (course.ownerId !== user.id) {
        throw new Error(
          'You do not have permission to create sections in this course',
        );
      }

      let parent: Section | null = null;
      if (parentId) {
        parent = await this.sectionRepository.findOne({
          where: { id: parentId },
        });
      }
      const section = this.sectionRepository.create({
        ...sectionData,
        course,
        parent,
      });
      const savedSection = await this.sectionRepository.save(section);
      return plainToClass(SectionDto, savedSection);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async update(
    id: number,
    updateSectionDto: UpdateSectionDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user: User,
  ): Promise<SectionDto> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    const { ...updateData } = updateSectionDto;
    Object.assign(section, updateData);
    const newSection = await this.sectionRepository.save(section);
    if (section.parentId && !isNaN(updateData.estimatedTime)) {
      await this.countEstimatedTime(section.parentId);
    }
    return plainToClass(SectionDto, newSection);
  }

  private async countEstimatedTime(id: number): Promise<Section> {
    try {
      const parentSection = await this.sectionRepository.findOne({
        where: { id },
      });

      if (!parentSection) {
        return;
      }

      const childSections = await this.sectionRepository.find({
        where: { parentId: id },
      });

      parentSection.estimatedTime = childSections.reduce(
        (total, child) => total + (child.estimatedTime || 0),
        0,
      );
      return await this.sectionRepository.save(parentSection);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: number): Promise<SectionDto> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['parent'],
    });
    return plainToClass(SectionDto, section);
  }

  async findOneFullData(id: number): Promise<Section> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['parent', 'childrens'],
    });
    return section;
  }

  async findByCourse(courseId: number): Promise<SectionDto[]> {
    const sections = await this.sectionRepository.find({
      where: {
        course: { id: courseId },
        parent: IsNull(),
      },
      relations: ['childrens'],
      order: { createdAt: 'ASC' },
    });
    return plainToClass(SectionDto, sections);
  }

  async findContent(sectionId: number): Promise<SectionContentDto> {
    const section = await this.sectionRepository.findOne({
      where: {
        id: sectionId,
      },
      relations: ['post', 'video', 'video.file', 'files'],
    });
    if (!section) {
      throw new NotFoundException(`Section not found`);
    }
    return plainToClass(SectionContentDto, section);
  }

  async addFile(
    sectionId: number,
    file: Express.Multer.File,
    user: User,
  ): Promise<FileDto> {
    try {
      if (!user) {
        throw new UnauthorizedException('Unauthorized');
      }
      const section = await await this.findOneFullData(sectionId);
      if (!section) {
        throw new NotFoundException(`Section not found`);
      }

      const type = SystemFileType.COURSE_CONTENT;
      const savedFile: FileDto = await this.fileService.create(file, {
        systemType: type,
        sectionId,
        courseId: section.courseId,
        userId: user?.id,
      });
      return savedFile;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async removeFile(
    id: number,
    // user: User,
  ): Promise<any> {
    try {
      await this.fileService.update(id, { deleted: true });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async remove(id: number): Promise<void> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section not found`);
    }
    await this.sectionRepository.delete(id);
    if (section.parentId && !isNaN(section.estimatedTime)) {
      this.countEstimatedTime(section.parentId);
    }
    return;
  }

  async countByCourse(id: number) {
    return this.sectionRepository.count({
      where: { courseId: id, parentId: Not(IsNull()) },
    });
  }
}
