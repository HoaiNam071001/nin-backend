import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from '../../../common/enums/roles.enum';
import { DuplicateEntryException } from '../../../common/exceptions/database/duplicate-entry.exception';
import { CustomNotFoundException } from '../../../common/exceptions/http/custom-not-found.exception';
import { generateSlug } from '../../../common/utils';
import { User } from '../../user/entity/user.entity';
import { NotificationType } from '../../user/modules/notifications/notification.dto';
import { NotificationsService } from '../../user/modules/notifications/notifications.service';
import { CategoryService } from '../_modules/category/service/category.service';
import { LevelService } from '../_modules/level/service/level.service';
import { TopicService } from '../_modules/topic/service/topic.service';
import {
  CourseDto,
  CoursePayloadDto,
  CourseStatusPayloadDto,
} from '../dto/course.dto';
import { DiscountDto, DiscountPayloadDto } from '../dto/discount.dto';
import { Course } from '../entity/course.entity';
import { Discount } from '../entity/discount.entity';
import { CourseStatus } from '../model/course.model';
import { CourseService } from './course.service';

@Injectable()
export class CourseUpdateService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly levelService: LevelService,
    private readonly topicService: TopicService,
    private readonly courseService: CourseService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Discount) // Inject Discount repository
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async create(courseDto: CoursePayloadDto, user: User): Promise<CourseDto> {
    try {
      const course = this.courseRepository.create({
        ...courseDto,
        slug: generateSlug(courseDto.name),
        owner: user,
      });

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
    // course.slug = payload.slug ?? generateSlug(payload.name); // Tạo slug mới nếu tên thay đổi
    course.description = payload.description ?? course.description;
    course.thumbnail = payload.thumbnail ?? course.thumbnail;
    course.price = payload.price ?? course.price;
    // course.estimatedTime = payload.estimatedTime ?? course.estimatedTime;
    course.summary = payload.summary ?? course.summary;

    if (payload.categoryId && payload.categoryId !== course.category?.id) {
      course.category = await this.categoryService.findByById(
        payload.categoryId,
      );
    }

    if (
      payload.subCategoryId &&
      payload.subCategoryId !== course.subCategory?.id
    ) {
      course.subCategory = await this.categoryService.findByById(
        payload.subCategoryId,
      );
    }

    if (payload.levelId && payload.levelId !== course.level?.id) {
      course.level = await this.levelService.findByById(payload.levelId);
    }

    if (
      payload.topicIds &&
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
    const { status, content } = payloadDto;

    if (
      [CourseStatus.REJECT].includes(status) &&
      !user.roles.some((e) => e.roleName === Role.EDUCATION_MANAGER)
    ) {
      throw new UnauthorizedException(
        'You do not have permission to update this course status',
      );
    }

    course.status = status;

    try {
      await this.courseRepository.save(course);

      if (
        user.id !== course.ownerId &&
        [CourseStatus.READY, CourseStatus.REJECT].includes(status)
      ) {
        const mapper = {
          [CourseStatus.REJECT]: NotificationType.COURSE_REJECTED,
          [CourseStatus.READY]: NotificationType.COURSE_APPROVED,
        };
        this.notificationsService.create({
          type: mapper[status],
          userId: course.ownerId,
          courseId: course.id,
          data: {
            content: content,
          },
        });
      }

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

  async createDiscount(payload: DiscountPayloadDto): Promise<DiscountDto> {
    try {
      const discount = this.discountRepository.create(payload);
      const savedDiscount = await this.discountRepository.save(discount);
      return plainToClass(DiscountDto, savedDiscount);
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

  async updateDiscount(
    id: number,
    payload: DiscountPayloadDto,
  ): Promise<DiscountDto> {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new CustomNotFoundException('Discount not found');
    }

    Object.assign(discount, payload);
    const updatedDiscount = await this.discountRepository.save(discount);
    return plainToClass(DiscountDto, updatedDiscount);
  }

  async deleteDiscount(id: number): Promise<void> {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new CustomNotFoundException('Discount not found');
    }
    await this.discountRepository.delete(id);
  }

  async getDiscountById(id: number): Promise<DiscountDto> {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new CustomNotFoundException('Discount not found');
    }
    return plainToClass(DiscountDto, discount);
  }

  async getDiscountsByCourseId(courseId: number): Promise<DiscountDto[]> {
    const discounts = await this.discountRepository.find({
      where: { course: { id: courseId } },
    });
    return discounts.map((discount) => plainToClass(DiscountDto, discount));
  }
}
