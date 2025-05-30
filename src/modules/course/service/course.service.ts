import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Not, Repository } from 'typeorm';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination-response.dto';
import { CustomNotFoundException } from '../../../common/exceptions/http/custom-not-found.exception';
import { PaymentService } from '../../payment/payment.service';
import { ShortUser } from '../../user/dto/user.dto';
import { User } from '../../user/entity/user.entity';
import { UserService } from '../../user/user.service';
import { CategoryDto } from '../_modules/category/dto/category.dto';
import { LevelDto } from '../_modules/level/dto/level.dto';
import { TopicService } from '../_modules/topic/service/topic.service';
import { CourseDto } from '../dto/course.dto';
import { DiscountDto } from '../dto/discount.dto';
import { Course } from '../entity/course.entity';
import { CourseStatus } from '../model/course.model';
@Injectable()
export class CourseService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly topicService: TopicService,
    private readonly userService: UserService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async getById(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'category',
        'subCategory',
        'level',
        'discounts',
        'instructors',
        'instructors.user',
      ],
    });
    if (!course) {
      throw new Error('Course not found');
    }

    const courseDto = plainToClass(CourseDto, course);
    courseDto.owner = plainToClass(
      ShortUser,
      await this.userService.findById(course.ownerId),
    );
    courseDto.category = plainToClass(CategoryDto, course.category);
    courseDto.subCategory = plainToClass(CategoryDto, course.subCategory);
    courseDto.level = plainToClass(LevelDto, course.level);
    courseDto.topics = await this.topicService.findByCourse(id);
    const now = new Date(); // Lấy thời gian hiện tại
    courseDto.discounts = course.discounts
      .filter((discount) => {
        const startDate = new Date(discount.startDate); // Chuyển đổi thành Date
        const endDate = new Date(discount.endDate); // Chuyển đổi thành Date
        return endDate >= now && startDate <= now;
      })
      .map((item) => plainToClass(DiscountDto, item));
    return courseDto;
  }

  async findByOwner(userId: number, pagable: PagingRequestBase) {
    const query = new PagingRequestDto<Course>(pagable, ['name']).mapOrmQuery({
      relations: ['owner', 'topics', 'level'],
      where: {
        ownerId: userId,
        status: Not(CourseStatus.DELETED),
      },
    });
    const [courses, total] = await this.courseRepository.findAndCount(query);

    return new PaginationResponseDto<Course>(
      courses.map((e) => plainToClass(Course, e)),
      total,
      pagable.page,
      pagable.size,
    );
  }

  async findPublicByOwner(userId: number, pagable: PagingRequestBase) {
    const query = new PagingRequestDto<Course>(pagable, ['name']).mapOrmQuery({
      relations: ['owner', 'topics', 'level'],
      where: {
        ownerId: userId,
        status: CourseStatus.READY,
      },
    });
    const [courses, total] = await this.courseRepository.findAndCount(query);

    return new PaginationResponseDto<Course>(
      courses.map((e) => plainToClass(Course, e)),
      total,
      pagable.page,
      pagable.size,
    );
  }

  async findBySubscription(user: User, pagAble: PagingRequestBase) {
    const subscriptions = await this.paymentService.findSubscriptionsByUser(
      user,
      pagAble,
    );
    return new PaginationResponseDto<Course>(
      subscriptions.content.map((sub) => sub.course),
      subscriptions.totalElements,
      pagAble.page,
      pagAble.size,
    );
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['owner', 'level'],
    });
    if (!course) {
      throw new CustomNotFoundException('Course not found');
    }
    return plainToClass(Course, course);
  }

  async remove(id: number, user: User): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id },
    });
    if (!course) {
      throw new CustomNotFoundException('Course not found');
    }
    if (course.ownerId !== user.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this course',
      );
    }
    if (course.status === CourseStatus.DELETED) {
      throw new BadRequestException('Course already deleted');
    }
    if (course.status === CourseStatus.READY) {
      course.status = CourseStatus.DELETED;
      await this.courseRepository.save(course);
      return;
    }
    await this.courseRepository.delete(id);
  }
}
