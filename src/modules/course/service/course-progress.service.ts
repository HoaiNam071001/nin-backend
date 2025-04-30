import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination-response.dto';
import {
  Section,
  SectionProgress,
} from '../_modules/section/entity/section.entity';
import { CourseProgress } from '../entity/course.entity';
@Injectable()
export class CourseProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private courseProgressRepository: Repository<CourseProgress>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(SectionProgress)
    private sectionProgressRepository: Repository<SectionProgress>,
  ) {}

  async updateSectionProgress(
    userId: number,
    courseId: number,
  ): Promise<CourseProgress> {
    const courseProgress = await this.courseProgressRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    const progress = await this.getProgress(userId, courseId);

    if (!courseProgress) {
      const sectionProgress = this.courseProgressRepository.create({
        user: { id: userId },
        course: { id: courseId },
        progress,
      });

      const item = await this.courseProgressRepository.save(sectionProgress);
      return this.courseProgressRepository.findOne({
        where: { id: item.id },
        relations: ['course'],
      });
    }

    courseProgress.progress = progress;
    await this.courseProgressRepository.save(courseProgress);
    return this.courseProgressRepository.findOne({
      where: { id: courseProgress.id },
      relations: ['section'],
    });
  }

  async getProgress(userId: number, courseId: number) {
    const totalChildSections = await this.sectionRepository.count({
      where: {
        course: { id: courseId },
        parent: Not(IsNull()),
      },
    });

    // Count completed sections for the user in the course
    const completedSections = await this.sectionProgressRepository.count({
      where: {
        user: { id: userId },
        section: {
          course: { id: courseId },
          parent: Not(IsNull()),
        },
        completed: true,
      },
    });
    return totalChildSections === 0
      ? 0
      : Number(((completedSections / totalChildSections) * 100).toFixed(2));
  }

  async getCourseProgress(
    userId: number,
    courseId: number,
  ): Promise<CourseProgress | undefined> {
    return this.courseProgressRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
      relations: ['course'],
    });
  }

  async getInProgressesByUser(userId: number, pagAble: PagingRequestBase) {
    const query = new PagingRequestDto<CourseProgress>(pagAble, []).mapOrmQuery(
      {
        where: {
          userId,
        },
        relations: ['course'],
      },
    );

    const [data, total] =
      await this.courseProgressRepository.findAndCount(query);

    return new PaginationResponseDto<CourseProgress>(
      data,
      total,
      pagAble.page,
      pagAble.size,
    );
  }
}
