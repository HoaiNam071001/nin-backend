import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PagingRequestDto } from '../../../common/dto/pagination-request.dto';
import { Course } from '../entity/course.entity';
import { CourseSearchService } from '../service/course-search.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CourseSearchFilterDto } from '../dto/course-search.dto';

@UseGuards(JwtAuthGuard)
@Controller('course-search')
export class CourseSearchController {
  constructor(private readonly courseSearchService: CourseSearchService) {}

  // Lấy tất cả các khóa học
  @Get()
  async findMyCourse(
    @Query() paging: PagingRequestDto<Course>,
    @Query() filtersDto: CourseSearchFilterDto,
  ) {
    return this.courseSearchService.find(paging, filtersDto);
  }
}
