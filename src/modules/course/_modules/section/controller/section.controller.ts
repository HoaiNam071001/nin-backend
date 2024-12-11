import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SectionService } from '../service/section.service';
import {
  CreateSectionDto,
  SectionContentDto,
  SectionDto,
  UpdateSectionDto,
} from '../dto/section.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AuthRequest } from '../../../../../common/interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDto } from '../../../../file/dto/file.dto';

@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createSectionDto: CreateSectionDto,
    @Req() { user }: AuthRequest,
  ): Promise<SectionDto> {
    return this.sectionService.create(createSectionDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Body() updateSectionDto: UpdateSectionDto,
    @Req() { user }: AuthRequest,
    @Param('id') id: number,
  ): Promise<SectionDto> {
    return this.sectionService.update(id, updateSectionDto, user);
  }

  @Get('/content/:id')
  async findContent(@Param('id') id: number): Promise<SectionContentDto> {
    return this.sectionService.findContent(id);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number): Promise<SectionDto> {
    return this.sectionService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') sectionId: number) {
    return this.sectionService.remove(sectionId);
  }

  // Get all sections by Course ID
  @Get('course/:courseId')
  async findByCourse(
    @Param('courseId') courseId: number,
  ): Promise<SectionDto[]> {
    return this.sectionService.findByCourse(courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':courseId/add-file')
  @UseInterceptors(FileInterceptor('file'))
  async addFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() { user }: AuthRequest,
    @Param('courseId') courseId: number,
  ): Promise<FileDto> {
    return this.sectionService.addFile(courseId, file, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/remove-file/:fileId')
  async removeFile(
    // @Req() { user }: AuthRequest,
    @Param('fileId') fileId: number,
  ): Promise<FileDto> {
    return this.sectionService.removeFile(fileId);
  }
}
