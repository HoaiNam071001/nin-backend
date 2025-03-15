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
} from '@nestjs/common';
import { CourseCommentService } from '../service/comment.service';
import {
  CommentResponseDto,
  CreateCommentDto,
  GetCommentDto,
} from '../dto/comment.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AuthRequest } from '../../../../../common/interfaces';
import { PagingRequestBase } from '../../../../../common/dto/pagination-request.dto';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CourseCommentController {
  constructor(private courseCommentService: CourseCommentService) {}

  @Post('course/:id')
  create(
    @Req() { user }: AuthRequest,
    @Body() payload: CreateCommentDto,
    @Param('id') id: number,
  ): Promise<CommentResponseDto> {
    return this.courseCommentService.create(user.id, id, payload);
  }

  @Get('course/:id')
  find(
    @Param('id') id: number,
    @Query() paging: PagingRequestBase,
    @Query() payload: GetCommentDto,
  ) {
    return this.courseCommentService.findByPaging(id, payload, paging);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.courseCommentService.remove(Number(id));
  }
}
