import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Course } from './entity/course.entity';
import { CourseDto } from './dto/course.dto';
import { CustomNotFoundException } from '../../common/exceptions/http/custom-not-found.exception';
import { DuplicateEntryException } from '../../common/exceptions/database/duplicate-entry.exception';
import { User } from '../user/entity/user.entity';
import { plainToClass } from 'class-transformer';
import { PagingRequestDto } from '../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto';
import { generateSlug } from '../../common/utils';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(courseDto: CourseDto, user: User): Promise<Course> {
    const course = this.courseRepository.create({
      ...courseDto,
      owner: user,
      slug: generateSlug(courseDto.name),
    });

    try {
      await this.courseRepository.save(course);
      return course;
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

  async getById(id: number) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'category',
        'subCategory',
        'level',
        'courseTopics',
        'courseTopics.topic',
        'owner',
      ],
    });

    if (!course) {
      throw new Error('Course not found');
    }

    return plainToClass(CourseDto, course);
  }

  async updateOne(
    id: number,
    courseDto: CourseDto,
    user: User,
  ): Promise<Course> {
    const course = await this.getById(id);
    if (!course) {
      throw new CustomNotFoundException('Course not found');
    }

    if (course.owner.id !== user.id) {
      throw new UnauthorizedException(
        'You do not have permission to update this course',
      );
    }
    Object.assign(course, courseDto);
    return await this.courseRepository.save(course);
  }

  async findByOwner(
    user: User,
    pagable: PagingRequestDto<Course>,
  ): Promise<{ data: Course[]; total: number }> {
    const query = new PagingRequestDto(pagable, ['name']).mapOrmQuery({
      relations: ['owner'],
      where: {
        owner: user,
      },
    });
    const [courses, total] = await this.courseRepository.findAndCount(query);

    return new PaginationResponseDto<Course>(
      plainToClass(Course, courses),
      total,
      query.page,
      query.limit,
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

  async update(
    id: number,
    updateCourseDto: CourseDto,
    user: User,
  ): Promise<Course> {
    const course = await this.findOne(id);
    if (!course) {
      throw new CustomNotFoundException('Course not found');
    }

    // if (course.owner_id !== user.id) {
    //   throw new UnauthorizedException(
    //     'You do not have permission to update this course',
    //   );
    // }
    // Cập nhật các trường có trong DTO
    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }
}
