import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entity/course.entity';
import { CourseDto } from '../dto/course.dto';
import { CustomNotFoundException } from '../../../common/exceptions/http/custom-not-found.exception';
import { User } from '../../user/entity/user.entity';
import { plainToClass } from 'class-transformer';
import { PagingRequestDto } from '../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination-response.dto';
import { ShortUser } from '../../user/dto/user.dto';
import { CategoryDto } from '../_modules/category/dto/category.dto';
import { LevelDto } from '../_modules/level/dto/level.dto';
import { UserService } from '../../user/user.service';
import { TopicService } from '../_modules/topic/service/topic.service';
@Injectable()
export class CourseService {
  constructor(
    private readonly topicService: TopicService,
    private readonly userService: UserService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async getById(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['category', 'subCategory', 'level'],
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
    return courseDto;
  }

  async findByOwner(user: User, pagable: PagingRequestDto<Course>) {
    const query = new PagingRequestDto(pagable, ['name']).mapOrmQuery({
      relations: ['owner'],
      where: {
        ownerId: user.id,
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

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!course) {
      throw new CustomNotFoundException('Course not found');
    }
    return plainToClass(Course, course);
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }
}
