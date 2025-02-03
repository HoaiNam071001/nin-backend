import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../entity/course.entity';
import { In, Repository } from 'typeorm';
import { PagingRequestDto } from '../../../common/dto/pagination-request.dto';
import { CourseDto } from '../dto/course.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination-response.dto';
import { plainToClass } from 'class-transformer';
import { CourseSearchFilterDto } from '../dto/course-search.dto';
import { CategoryDto } from '../_modules/category/dto/category.dto';
import { LevelDto } from '../_modules/level/dto/level.dto';

@Injectable()
export class CourseSearchService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  private buildFilterQuery(filtersDto: CourseSearchFilterDto): any {
    const where: any = {};

    if (filtersDto.status) {
      where.status =
        filtersDto.status instanceof Array
          ? In(filtersDto.status)
          : filtersDto.status;
    }

    if (filtersDto.categoryIds) {
      where.categoryId =
        filtersDto.categoryIds instanceof Array
          ? In(filtersDto.categoryIds)
          : filtersDto.categoryIds;
    }

    if (filtersDto.levelIds) {
      where.levelId =
        filtersDto.levelIds instanceof Array
          ? In(filtersDto.levelIds)
          : filtersDto.levelIds;
    }

    return where;
  }

  async find(
    pagable: PagingRequestDto<Course>,
    filtersDto: CourseSearchFilterDto,
  ) {
    const where = this.buildFilterQuery(filtersDto);

    const query = new PagingRequestDto(pagable, [
      'name',
      'summary',
    ]).mapOrmQuery({
      where,
    });
    query.relations = ['owner', 'category', 'subCategory', 'level', 'topics'];
    const [data, total] = await this.courseRepository.findAndCount(query);

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
}
