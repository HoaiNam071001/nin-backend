import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import {
  DataSource,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import {
  DynamicFilter,
  PagingRequestBase,
  PagingRequestDto,
  SortOrder,
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
    private dataSource: DataSource,
    private searchService: SearchService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Discount) // Inject Discount repository
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async find(pagable: PagingRequestBase, filtersDto: CourseSearchFilterDto) {
    const request = new PagingRequestDto<Course>(pagable, ['name', 'summary']);
    const filter: DynamicFilter<Course> = {};
    filter.AND = [];
    if (filtersDto.status) {
      filter.AND.push({ status: filtersDto.status as CourseStatus });
    }
    if (filtersDto.levelIds) {
      filter.AND.push({ levelId: filtersDto.levelIds as number });
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
      ['owner', 'category', 'subCategory', 'level', 'topics'],
      filter,
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
      where: { id: In(ids), status: Not(CourseStatus.DELETED) },
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

    if (!course || course.status === CourseStatus.DELETED) {
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
        status: Not(CourseStatus.DELETED),
      },
      relations: ['instructors', 'instructors.user', 'owner', 'level'],
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

  async getTopRatings() {
    const mana = this.dataSource.manager;
    const query = `
    WITH top_rated AS (
        -- Lấy các khóa học có >= 10 đánh giá
        SELECT 
            c.*,  -- Tất cả field từ courses
            u.id AS owner_id,              -- ID của owner
            u.email AS owner_email,        -- Email
            u.avatar AS owner_avatar,      -- Avatar
            u.first_name AS owner_first_name,  -- Họ
            u.last_name AS owner_last_name,    -- Tên
            u.full_name AS owner_full_name,    -- Họ và tên đầy đủ
            l.name AS level_name,                  -- Tên cấp độ từ levels
            c.rating AS average_rating,
            COUNT(cr.id) AS review_count,
            (COUNT(cr.id) * c.rating + 10 * 3.5) / (COUNT(cr.id) + 10) AS weighted_rating
        FROM courses c
        LEFT JOIN course_ratings cr ON c.id = cr.course_id
        LEFT JOIN users u ON c.owner_id = u.id  -- Relation với bảng users
        LEFT JOIN levels l ON c.level_id = l.id  -- Relation với bảng levels
        WHERE c.status = 'ready'
        GROUP BY 
            c.id, 
            u.id, u.email, u.avatar, u.first_name, u.last_name, u.full_name, l.name
        HAVING COUNT(cr.id) >= 10
        ORDER BY weighted_rating DESC
        LIMIT 10
    ),
    remaining AS (
        -- Lấy thêm các khóa học có < 10 đánh giá nếu cần
        SELECT 
            c.*,  -- Tất cả field từ courses
            u.id AS owner_id,
            u.email AS owner_email,
            u.avatar AS owner_avatar,
            u.first_name AS owner_first_name,
            u.last_name AS owner_last_name,
            u.full_name AS owner_full_name,
            l.name AS level_name,
            c.rating AS average_rating, -- Tính toán average_rating từ course_ratings
            COUNT(cr.id) AS review_count,
            (COUNT(cr.id) * c.rating + 10 * 3.5) / (COUNT(cr.id) + 10) AS weighted_rating
        FROM courses c
        LEFT JOIN course_ratings cr ON c.id = cr.course_id
        LEFT JOIN users u ON c.owner_id = u.id
        LEFT JOIN levels l ON c.level_id = l.id
        WHERE c.id NOT IN (SELECT id FROM top_rated) AND c.status = 'ready'  -- Loại bỏ các khóa đã lấy
        GROUP BY 
            c.id, 
            u.id, u.email, u.avatar, u.first_name, u.last_name, u.full_name, l.name
        HAVING c.rating > 0  -- Chỉ lấy các khóa có ít nhất 1 đánh giá
        ORDER BY average_rating DESC, c.updated_at DESC  -- Tiêu chí phụ
        LIMIT (10 - (SELECT COUNT(*) FROM top_rated)) 
    )
    -- Kết hợp kết quả
    SELECT * FROM top_rated
    UNION
    SELECT * FROM remaining
    ORDER BY weighted_rating DESC, average_rating DESC, updated_at DESC
    LIMIT 10;
    `;
    const rawData = await mana.query(query);

    // Chuyển đổi kết quả rawData thành cấu trúc mong muốn
    return rawData.map((item) => ({
      id: item.id,
      name: item.name,
      thumbnail: item.thumbnail,
      description: item.description,
      estimatedTime: item.estimatedTime,
      price: item.price,
      rating: item.rating,
      slug: item.slug,
      status: item.status,
      owner: {
        id: item.owner_id,
        email: item.owner_email,
        avatar: item.owner_avatar,
        firstName: item.owner_first_name,
        lastName: item.owner_last_name,
        fullName: item.owner_full_name,
      },
      level: {
        id: item.level_id,
        name: item.level_name,
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async getNewPublishCourse() {
    const [data] = await this.courseRepository.findAndCount({
      where: { status: CourseStatus.READY },
      order: { updatedAt: SortOrder.DESC },
      relations: ['owner', 'category', 'level', 'subCategory'],
      take: 10,
    });

    return data;
  }
}
