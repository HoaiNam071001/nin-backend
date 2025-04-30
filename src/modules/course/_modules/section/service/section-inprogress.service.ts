import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination-response.dto';
import { User } from '../../../../user/entity/user.entity';
import { CourseProgressService } from '../../../service/course-progress.service';
import { Section, SectionProgress } from '../entity/section.entity';

@Injectable()
export class SectionInprogressService {
  constructor(
    private courseProgressService: CourseProgressService,
    @InjectRepository(SectionProgress)
    private sectionProgressRepository: Repository<SectionProgress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
  ) {}

  async createSectionProgress(
    userId: number,
    sectionId: number,
  ): Promise<SectionProgress> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
    });

    if (!user || !section) {
      throw new Error('User or Section not found');
    }

    const progress = await this.getSectionProgress(userId, sectionId);
    if (progress) {
      return progress;
    }

    const sectionProgress = this.sectionProgressRepository.create({
      user: user,
      section: section,
      progress: 0,
    });

    const item = await this.sectionProgressRepository.save(sectionProgress);
    return item;
  }

  async updateSectionProgress(
    userId: number,
    sectionId: number,
    updateData: Partial<SectionProgress>,
  ): Promise<SectionProgress> {
    const sectionProgress = await this.sectionProgressRepository.findOne({
      where: { user: { id: userId }, section: { id: sectionId } },
    });

    if (!sectionProgress) {
      const sectionProgress = this.sectionProgressRepository.create({
        user: { id: userId },
        section: { id: sectionId },
        progress: 0,
        ...updateData,
      });

      const item = await this.sectionProgressRepository.save(sectionProgress);
      return this.sectionProgressRepository.findOne({
        where: { id: item.id },
        relations: ['section'],
      });
    }
    Object.assign(sectionProgress, updateData);
    await this.sectionProgressRepository.save(sectionProgress);
    return this.sectionProgressRepository.findOne({
      where: { id: sectionProgress.id },
      relations: ['section'],
    });
  }

  async getSectionProgress(
    userId: number,
    sectionId: number,
  ): Promise<SectionProgress | undefined> {
    return this.sectionProgressRepository.findOne({
      where: { user: { id: userId }, section: { id: sectionId } },
      relations: ['section'],
    });
  }

  async getSectionsProgressesByCourse(
    userId: number,
    courseId: number,
  ): Promise<SectionProgress[]> {
    return this.sectionProgressRepository.find({
      where: {
        user: {
          id: userId,
        },
        section: { courseId },
      },
      relations: ['section'],
    });
  }

  async getInProgressesByUser(userId: number, pagAble: PagingRequestBase) {
    const query = new PagingRequestDto<SectionProgress>(pagAble, [
      'name',
      'summary',
    ]).mapOrmQuery({
      where: {
        userId,
        completed: false,
      },
      relations: ['section', 'section.course'],
    });

    const [data, total] =
      await this.sectionProgressRepository.findAndCount(query);

    return new PaginationResponseDto<SectionProgress>(
      data,
      total,
      pagAble.page,
      pagAble.size,
    );
  }
}
