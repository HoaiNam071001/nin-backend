import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../../common/dto/pagination-request.dto';
import { CourseSearchFilterDto } from '../dto/course-search.dto';
import { Course } from '../entity/course.entity';
import { CourseSearchService } from '../service/course-search.service';
import { CourseService } from '../service/course.service';

@Controller('course-search')
export class CourseSearchController {
  constructor(
    private readonly courseSearchService: CourseSearchService,
    private readonly courseService: CourseService,
  ) {}

  // Lấy tất cả các khóa học
  @Get()
  async findMyCourse(
    @Query() paging: PagingRequestDto<Course>,
    @Query() filtersDto: CourseSearchFilterDto,
  ) {
    return this.courseSearchService.find(paging, filtersDto);
  }

  @Get('suggest')
  async suggest(@Query() paging: PagingRequestBase) {
    return this.courseSearchService.getByKeyword(paging);
  }

  @Get('full/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.courseSearchService.findBySlug(slug);
  }

  @Get('instructor/:id')
  async getByInstructor(
    @Param('id') id: number,
    @Query() paging: PagingRequestBase,
  ) {
    return this.courseSearchService.findByInstructor(id, paging);
  }

  @Get('owner/:id')
  async getByUser(@Param('id') id: number, @Query() paging: PagingRequestBase) {
    return this.courseService.findByOwner(id, paging);
  }
}
