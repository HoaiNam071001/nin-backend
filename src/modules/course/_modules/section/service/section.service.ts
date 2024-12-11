import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Section } from '../entity/section.entity';
import {
  CreateSectionDto,
  SectionContentDto,
  SectionDto,
  UpdateSectionDto,
} from '../dto/section.dto';
import { User } from '../../../../user/entity/user.entity';
import { CourseService } from '../../../service/course.service';
import { plainToClass } from 'class-transformer';
import { SystemFileType } from '../../../../data/models';
import { FileService } from '../../../../file/file.service';
import { FileDto } from '../../../../file/dto/file.dto';

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
      console.log(err);
      throw new InternalServerErrorException(err);
    }
  }

  async update(
    id: number,
    updateSectionDto: UpdateSectionDto,
    user: User,
  ): Promise<SectionDto> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    const { ...updateData } = updateSectionDto;

    // if (parentId) {
    //   const parentSection = await this.sectionRepository.findOne({
    //     where: { id: parentId },
    //   });
    //   if (!parentSection) {
    //     throw new NotFoundException(
    //       `Parent Section with ID ${parentId} not found`,
    //     );
    //   }
    //   section.parent = parentSection;
    // }

    Object.assign(section, updateData);

    return plainToClass(SectionDto, this.sectionRepository.save(section));
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
    // .createQueryBuilder('section')
    //   .leftJoinAndSelect('section.childrens', 'childrens')
    //   .where('section.course_id = :courseId', { courseId })
    //   .andWhere('section.parent_id IS NULL')
    //   .orderBy('section.created_at', 'ASC') // Sắp xếp các section cha
    //   .addOrderBy('childrens.created_at', 'ASC') // Sắp xếp childrens theo ASC
    //   .getMany();
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
      console.log(err);
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
    await this.sectionRepository.delete(id);
  }
}
