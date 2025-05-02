import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PagingRequestDto } from '../../../common/dto/pagination-request.dto';
import { AuthRequest } from '../../../common/interfaces';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CourseDto } from '../dto/course.dto';
import { CourseProgressService } from '../service/course-progress.service';

@UseGuards(JwtAuthGuard)
@Controller('course-progress')
export class CourseProgressController {
  constructor(private readonly courseProgressService: CourseProgressService) {}

  // Lấy tất cả các khóa học của user tạo
  @Get()
  async findProgress(
    @Req() { user }: AuthRequest,
    @Query() paging: PagingRequestDto<CourseDto>,
  ) {
    return this.courseProgressService.getInProgressesByUser(user.id, paging);
  }

  @Get('/course/:id')
  async getInstructorById(
    @Param('id') id: number,
    @Req() { user }: AuthRequest,
  ) {
    return this.courseProgressService.getCourseProgress(user.id, id);
  }
}
