import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CourseRatingService } from './course-rating.service';
import {
  CreateCourseRatingDto,
  UpdateCourseRatingDto,
} from './course-rating.dto';
import { CourseRating } from './course-rating.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AuthRequest } from '../../../../common/interfaces';
import { PagingRequestBase } from '../../../../common/dto/pagination-request.dto';

@Controller('course-ratings')
export class CourseRatingController {
  constructor(private readonly courseRatingService: CourseRatingService) {}

  @Get('course/:id/summary')
  async getSummary(@Param('id') courseId: number) {
    return await this.courseRatingService.getRatingStatsByCourse(courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('course/:id/user')
  async getRatingByUser(
    @Req() { user }: AuthRequest,
    @Param('id') courseId: number,
  ) {
    return await this.courseRatingService.findOneByUser(user.id, courseId);
  }

  @UseGuards(JwtAuthGuard)
  // Tạo mới rating
  @Post('course/:id')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') courseId: number,
    @Req() { user }: AuthRequest,
    @Body() createCourseRatingDto: CreateCourseRatingDto,
  ): Promise<CourseRating> {
    return this.courseRatingService.create(
      user.id,
      courseId,
      createCourseRatingDto,
    );
  }

  // Lấy danh sách rating theo course với phân trang
  @Get('course/:id')
  async getByCourse(
    @Param('id') courseId: number,
    @Query() paging: PagingRequestBase,
    @Query('rating') rating: number,
  ) {
    return await this.courseRatingService.findByCourse(
      courseId,
      rating,
      paging,
    );
  }

  // Lấy chi tiết một rating theo ID
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<CourseRating> {
    return this.courseRatingService.findOne(id);
  }

  // Cập nhật rating
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseRatingDto: UpdateCourseRatingDto,
  ): Promise<CourseRating> {
    return this.courseRatingService.update(id, updateCourseRatingDto);
  }

  // Xóa rating
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.courseRatingService.remove(id);
  }
}
