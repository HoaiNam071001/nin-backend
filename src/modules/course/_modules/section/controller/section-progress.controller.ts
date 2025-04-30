import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { PagingRequestBase } from '../../../../../common/dto/pagination-request.dto';
import { AuthRequest } from '../../../../../common/interfaces';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { SectionProgress } from '../entity/section.entity';
import { SectionInprogressService } from '../service/section-inprogress.service';

@UseGuards(JwtAuthGuard)
@Controller('section-progress')
export class SectionInprogressController {
  constructor(
    private readonly sectionInprogressService: SectionInprogressService,
  ) {}

  @Post(':sectionId')
  @ApiBody({
    type: SectionProgress,
    description: 'Create section progress data',
  })
  async createSectionProgress(
    @Req() { user }: AuthRequest,
    @Param('sectionId') sectionId: number,
  ): Promise<SectionProgress> {
    return this.sectionInprogressService.createSectionProgress(
      user.id,
      sectionId,
    );
  }

  @Put(':sectionId')
  @ApiBody({
    type: SectionProgress,
    description: 'Update section progress data',
  })
  async updateSectionProgress(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() updateData: Partial<SectionProgress>,
    @Req() { user }: AuthRequest,
  ): Promise<SectionProgress> {
    return this.sectionInprogressService.updateSectionProgress(
      user.id,
      sectionId,
      updateData,
    );
  }

  @Get('user')
  async getInProgressesByUser(
    @Query() paging: PagingRequestBase,
    @Req() { user }: AuthRequest,
  ) {
    return this.sectionInprogressService.getInProgressesByUser(user.id, paging);
  }

  @Get(':sectionId')
  async getSectionProgress(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Req() { user }: AuthRequest,
  ): Promise<SectionProgress> {
    return this.sectionInprogressService.getSectionProgress(user.id, sectionId);
  }

  @Get('course/:courseId')
  @ApiParam({ name: 'courseId', type: Number })
  async getSectionsProgressesByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() { user }: AuthRequest,
  ): Promise<SectionProgress[]> {
    return this.sectionInprogressService.getSectionsProgressesByCourse(
      user.id,
      courseId,
    );
  }
}
