import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { NFile } from './entity/file.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../../common/interfaces';
import { FileDto } from './dto/file.dto';
import { SystemFileType } from '../data/models';
import { FileInterceptor } from '@nestjs/platform-express';

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
  ): Promise<FileDto> {
    return this.fileService.create(file, {
      systemType: type,
      userId: user.id,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<NFile> {
    return this.fileService.findById(id);
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
