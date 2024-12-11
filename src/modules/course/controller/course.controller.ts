import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
  Query,
} from '@nestjs/common';
import { CourseService } from '../service/course.service';
import { CourseDto, CoursePayloadDto } from '../dto/course.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthRequest } from '../../../common/interfaces';
import { CourseUpdateService } from '../service/course-update.service';
import { PagingRequestDto } from '../../../common/dto/pagination-request.dto';
import { Course } from '../entity/course.entity';

@UseGuards(JwtAuthGuard)
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseUpdateService: CourseUpdateService,
  ) {}

  // Tạo một khóa học mới
  @Post()
  async create(
    @Body() courseDto: CoursePayloadDto,
    @Req() { user }: AuthRequest,
  ): Promise<CourseDto> {
    return this.courseUpdateService.create(courseDto, user);
  }

  // Lấy tất cả các khóa học của user tạo
  @Get()
  async findMyCourse(
    @Req() { user }: AuthRequest,
    @Query() paging: PagingRequestDto<Course>,
  ) {
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
    @Body() courseDto: CoursePayloadDto,
    @Req() { user }: AuthRequest,
  ): Promise<CourseDto> {
    return this.courseUpdateService.updateOne(id, courseDto, user);
  }

  // // Xóa một khóa học
  // @Delete(':id')
  // async remove(@Param('id') id: number): Promise<void> {
  //   return this.courseService.remove(id);
  // }
}
