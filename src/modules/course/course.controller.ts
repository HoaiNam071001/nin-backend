import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { Course } from './entity/course.entity';
import { CourseDto } from './dto/course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../../common/interfaces';
import { PagingRequestDto } from '../../common/dto/pagination-request.dto';

@UseGuards(JwtAuthGuard)
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // Tạo một khóa học mới
  @Post()
  async create(
    @Body() courseDto: CourseDto,
    @Req() { user }: AuthRequest,
  ): Promise<Course> {
    return this.courseService.create(courseDto, user);
  }

  // Lấy tất cả các khóa học
  @Get()
  async findAll(
    @Req() req: AuthRequest,
    @Query() paging: PagingRequestDto<Course>,
  ) {
    const user = (req as any).user; // Lấy thông tin người dùng từ middleware
    return this.courseService.findByOwner(user, paging);
  }

  // Lấy một khóa học theo ID
  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.courseService.getById(id);
  }

  // Cập nhật thông tin khóa học
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() courseDto: CourseDto,
    @Req() { user }: AuthRequest,
  ): Promise<Course> {
    return this.courseService.update(id, courseDto, user);
  }

  // Xóa một khóa học
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.courseService.remove(id);
  }
}
