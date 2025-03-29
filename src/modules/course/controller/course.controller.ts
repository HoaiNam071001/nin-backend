import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PagingRequestDto } from '../../../common/dto/pagination-request.dto';
import { AuthRequest } from '../../../common/interfaces';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  CourseDto,
  CoursePayloadDto,
  CourseStatusPayloadDto,
} from '../dto/course.dto';
import { DiscountPayloadDto } from '../dto/discount.dto';
import { InstructorPayloadDto } from '../dto/instructor.dto';
import { CourseUpdateService } from '../service/course-update.service';
import { CourseService } from '../service/course.service';
import { InstructorService } from '../service/instructor.service';

@UseGuards(JwtAuthGuard)
@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseUpdateService: CourseUpdateService,
    private readonly instructorService: InstructorService,
  ) {}

  // Lấy tất cả các khóa học của user tạo
  @Get()
  async findMyCourse(
    @Req() { user }: AuthRequest,
    @Query() paging: PagingRequestDto<CourseDto>,
  ) {
    return this.courseService.findByOwner(user.id, paging);
  }

  @Get('registered')
  async findRegisteredCourses(
    @Req() { user }: AuthRequest,
    @Query() paging: PagingRequestDto<CourseDto>,
  ) {
    return this.courseService.findBySubscription(user, paging);
  }

  @Get('instructor/:id')
  async getInstructorById(@Param('id') id: number) {
    return this.instructorService.getByCourse(id);
  }

  // Lấy một khóa học theo ID
  @Get(':id')
  async getById(@Param('id') id: number) {
    return this.courseService.getById(id);
  }

  // Tạo một khóa học mới
  @Post()
  async create(
    @Body() courseDto: CoursePayloadDto,
    @Req() { user }: AuthRequest,
  ): Promise<CourseDto> {
    return this.courseUpdateService.create(courseDto, user);
  }

  @Post('instructor/:id')
  async addInstructor(
    @Param('id') id: number,
    @Body() payloadDto: InstructorPayloadDto,
  ) {
    return this.instructorService.add(id, payloadDto);
  }

  @Put('instructor/:id')
  async updateInstructor(
    @Param('id') id: number,
    @Body() payloadDto: InstructorPayloadDto,
  ) {
    return this.instructorService.update(id, payloadDto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() payloadDto: CourseStatusPayloadDto,
    @Req() { user }: AuthRequest,
  ): Promise<CourseDto> {
    return this.courseUpdateService.updateStatus(id, user, payloadDto);
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

  @Delete('instructor/:id')
  async removeInstructor(
    @Param('id') id: number,
    @Req() { user }: AuthRequest,
  ) {
    return this.instructorService.remove(user, id);
  }
  // // Xóa một khóa học
  // @Delete(':id')
  // async remove(@Param('id') id: number): Promise<void> {
  //   return this.courseService.remove(id);
  // }

  // Endpoint tạo giảm giá
  @Post(':courseId/discounts')
  async createDiscount(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() payload: DiscountPayloadDto,
  ) {
    payload.courseId = courseId;
    return this.courseUpdateService.createDiscount(payload);
  }

  // Endpoint cập nhật giảm giá
  @Put('discounts/:id')
  async updateDiscount(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: DiscountPayloadDto,
  ) {
    return this.courseUpdateService.updateDiscount(id, payload);
  }

  // Endpoint xóa giảm giá
  @Delete('discounts/:id')
  async deleteDiscount(@Param('id', ParseIntPipe) id: number) {
    return this.courseUpdateService.deleteDiscount(id);
  }

  // Endpoint lấy giảm giá theo ID
  @Get('discounts/:id')
  async getDiscountById(@Param('id', ParseIntPipe) id: number) {
    return this.courseUpdateService.getDiscountById(id);
  }

  // Endpoint lấy danh sách giảm giá của khóa học
  @Get(':courseId/discounts')
  async getDiscountsByCourseId(
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.courseUpdateService.getDiscountsByCourseId(courseId);
  }
}
