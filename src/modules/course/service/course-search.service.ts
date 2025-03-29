import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  DynamicFilter,
  PagingRequestBase,
  PagingRequestDto,
} from '../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination-response.dto';
import { CustomNotFoundException } from '../../../common/exceptions/http/custom-not-found.exception';
import { SearchService } from '../../ai/services/search.service';
import { FileService } from '../../file/file.service';
import { ShortUser } from '../../user/dto/user.dto';
import { CategoryDto } from '../_modules/category/dto/category.dto';
import { LevelDto } from '../_modules/level/dto/level.dto';
import { SectionService } from '../_modules/section/service/section.service';
import { CourseSearchFilterDto } from '../dto/course-search.dto';
import { CourseDto, FullCourseDto } from '../dto/course.dto';
import { DiscountDto } from '../dto/discount.dto';
import { InstructorDto } from '../dto/instructor.dto';
import { Course } from '../entity/course.entity';
import { Discount } from '../entity/discount.entity';
import { CourseStatus } from '../model/course.model';

@Injectable()
export class CourseSearchService {
  constructor(
    private fileService: FileService,
    private sectionService: SectionService,
    private searchService: SearchService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Discount) // Inject Discount repository
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async find(pagable: PagingRequestBase, filtersDto: CourseSearchFilterDto) {
    const request = new PagingRequestDto<Course>(pagable, ['name', 'summary']);
    const filter: DynamicFilter<Course> = {};
    if (filtersDto.status) {
      filter.AND = [{ status: filtersDto.status as CourseStatus }];
    }
    if (filtersDto.categoryIds) {
      filter.OR = [
        { categoryId: filtersDto.categoryIds as number },
        { subCategoryId: filtersDto.categoryIds as number },
      ];
    }

    const qb = request.buildQueryBuilder(
      this.courseRepository,
      'course',
      filter,
      ['owner', 'category', 'subCategory', 'level', 'topics'],
    );
    const [data, total] = await qb.getManyAndCount();

    return new PaginationResponseDto<CourseDto>(
      data.map((e) => ({
        ...plainToClass(CourseDto, e),
        category: plainToClass(CategoryDto, e.category),
        subCategory: plainToClass(CategoryDto, e.subCategory),
        level: plainToClass(LevelDto, e.level),
      })),
      total,
      pagable.page,
      pagable.size,
    );
  }

  async getByKeyword(paging: PagingRequestBase) {
    const ids = await this.searchService.search(paging);
    if (!ids?.length) {
      return []; // Return an empty array if no IDs are found
    }

    const courses = await this.courseRepository.find({
      where: { id: In(ids) }, // Use In() to find multiple IDs
    });

    return courses;
  }

  async findBySlug(slug: string): Promise<FullCourseDto> {
    const course = await this.courseRepository.findOne({
      where: { slug },
      relations: [
        'owner',
        'category',
        'subCategory',
        'level',
        'topics',
        'topics.topic',
        'instructors',
        'instructors.user',
        'targets',
      ],
    });

    if (!course) {
      throw new CustomNotFoundException('Course not found');
    }
    const now = new Date(); // Lấy thời gian hiện tại
    const discounts = await this.discountRepository.find({
      where: {
        courseId: course?.id,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
    });
    const totalSection = await this.sectionService.countByCourse(course.id);
    const totalFile = await this.fileService.countByCourse(course.id);
    return {
      ...plainToClass(FullCourseDto, course),
      category: plainToClass(CategoryDto, course.category),
      subCategory: plainToClass(CategoryDto, course.subCategory),
      level: plainToClass(LevelDto, course.level),
      topics: course.topics.map((t) => t.topic),
      instructors: plainToClass(
        InstructorDto,
        course.instructors.map((i) => ({
          ...i,
          user: plainToClass(ShortUser, i.user),
        })),
      ),
      totalSection,
      totalFile,
      discounts: plainToClass(DiscountDto, discounts),
    };
  }

  async findByInstructor(userId: number, pagable: PagingRequestBase) {
    const query = new PagingRequestDto<Course>(pagable, [
      'name',
      'summary',
    ]).mapOrmQuery({
      where: {
        instructors: {
          userId,
        },
      },
      relations: ['instructors', 'instructors.user', 'owner'],
    });
    const [data, total] = await this.courseRepository.findAndCount(query);

    return new PaginationResponseDto<CourseDto>(
      data.map((e) => ({
        ...plainToClass(CourseDto, e),
      })),
      total,
      pagable.page,
      pagable.size,
    );
  }
}
