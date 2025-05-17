import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PagingRequestBase } from '../../common/dto/pagination-request.dto';
import { AuthRequest } from '../../common/interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SystemFileType } from '../data/models';
import { FileDto, FileSearchPayload } from './dto/file.dto';
import { NFile } from './entity/file.entity';
import { FileService } from './file.service';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: SystemFileType,
    @Req() { user }: AuthRequest,
    @Body('courseId') courseId: number,
  ): Promise<FileDto> {
    return this.fileService.create(file, {
      systemType: type,
      userId: user.id,
      courseId: courseId,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<NFile> {
    return this.fileService.findById(id);
  }

  @Post('list')
  async findList(
    @Query() paging: PagingRequestBase,
    @Body() payload: FileSearchPayload,
  ) {
    return this.fileService.find(paging, payload);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() fileData: Partial<NFile>,
  ): Promise<NFile> {
    return this.fileService.update(id, fileData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.fileService.delete(id);
  }
}
