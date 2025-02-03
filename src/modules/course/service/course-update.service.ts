import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Course } from '../entity/course.entity';
import {
  CourseDto,
  CoursePayloadDto,
  CourseStatusPayloadDto,
} from '../dto/course.dto';
import { CustomNotFoundException } from '../../../common/exceptions/http/custom-not-found.exception';
import { DuplicateEntryException } from '../../../common/exceptions/database/duplicate-entry.exception';
import { User } from '../../user/entity/user.entity';
import { plainToClass } from 'class-transformer';
import { generateSlug } from '../../../common/utils';
import { CourseService } from './course.service';
import { CategoryService } from '../_modules/category/service/category.service';
import { LevelService } from '../_modules/level/service/level.service';
import { TopicService } from '../_modules/topic/service/topic.service';

@Injectable()
export class CourseUpdateService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly levelService: LevelService,
    private readonly topicService: TopicService,
    private readonly courseService: CourseService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(courseDto: CoursePayloadDto, user: User): Promise<CourseDto> {
    try {
      const course = this.courseRepository.create({
        ...courseDto,
        slug: generateSlug(courseDto.name),
        owner: user,
      });

      // const assignRelation = async (
      //   relationField: 'category' | 'subCategory' | 'level',
      //   dtoField: 'categoryId' | 'subCategoryId' | 'levelId',
      //   repository: any,
      //   errorMessage: string,
      // ) => {
      //   const relationId = courseDto[dtoField];
      //   if (relationId) {
      //     const relationEntity = await repository.findOne({
      //       where: { id: relationId },
      //     });
      //     if (!relationEntity) {
      //       throw new CustomNotFoundException(errorMessage);
      //     }
      //     course[relationField] = relationEntity;
      //   }
      // };

      // await Promise.all([
      //   assignRelation(
      //     'category',
      //     'categoryId',
      //     this.categoryRepository,
      //     'Category not found',
      //   ),
      //   assignRelation(
      //     'subCategory',
      //     'subCategoryId',
      //     this.categoryRepository,
      //     'Subcategory not found',
      //   ),
      //   assignRelation(
      //     'level',
      //     'levelId',
      //     this.levelRepository,
      //     'Level not found',
      //   ),
      // ]);
      const savedCourse = await this.courseRepository.save(course);

      await this.topicService.createByCourse(
        savedCourse.id,
        courseDto.topicIds,
      );
      return await this.courseService.getById(savedCourse.id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        DuplicateEntryException.handleQueryFailedError(error)
      ) {
        throw new DuplicateEntryException();
      }
      throw error;
    }
  }

  async updateOne(
    id: number,
    payload: CoursePayloadDto,
    user: User,
  ): Promise<CourseDto> {
    const course: CourseDto = await this.courseService.getById(id);
    if (!course) {
      throw new CustomNotFoundException('Course not found');
    }

    if (course.owner.id !== user.id) {
      throw new UnauthorizedException(
        'You do not have permission to update this course',
      );
    }

    course.name = payload.name ?? course.name;
    course.slug = payload.slug ?? generateSlug(payload.name); // Tạo slug mới nếu tên thay đổi
    course.description = payload.description ?? course.description;
    course.thumbnail = payload.thumbnail ?? course.thumbnail;
    course.price = payload.price ?? course.price;
    course.estimatedTime = payload.estimatedTime ?? course.estimatedTime;
    // course.status = payload.status ?? course.status;
    course.summary = payload.summary ?? course.summary;
    if (payload.categoryId !== course.category?.id) {
      course.category = await this.categoryService.findByById(
        payload.categoryId,
      );
    }

    if (payload.subCategoryId !== course.subCategory?.id) {
      course.subCategory = await this.categoryService.findByById(
        payload.subCategoryId,
      );
    }

    if (payload.levelId !== course.level?.id) {
      course.level = await this.levelService.findByById(payload.levelId);
    }

    if (
      !(
        payload.topicIds?.length === course.topics?.length &&
        payload.topicIds?.every((x) => course.topics?.some((e) => e.id === x))
      )
    ) {
      this.topicService.updateByCourse(
        course.id,
        payload?.topicIds,
        course.topics,
      );
    }

    const updatedCourse = await this.courseRepository.save(
      plainToClass(Course, course),
    );

    return await this.courseService.getById(updatedCourse.id);
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }

  async updateStatus(
    id: number,
    user: User,
    payloadDto: CourseStatusPayloadDto,
  ): Promise<CourseDto> {
    if (!payloadDto) {
      throw new BadRequestException();
    }
    const course = await this.courseRepository.findOne({ where: { id } });

    if (!course) {
      throw new CustomNotFoundException('Course not found');
    }

    course.status = payloadDto.status;

    try {
      await this.courseRepository.save(course);
      return await this.courseService.getById(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        DuplicateEntryException.handleQueryFailedError(error)
      ) {
        throw new DuplicateEntryException();
      }
      throw error;
    }
  }
}
