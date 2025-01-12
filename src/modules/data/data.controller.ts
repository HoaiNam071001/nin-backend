import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Get,
  Param,
  // UseGuards,
  Body,
  // Req,
} from '@nestjs/common';
import { DataService } from './services/data.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SystemFileType } from './models';
// import { AuthRequest } from '../../common/interfaces';

// @UseGuards(JwtAuthGuard)
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: SystemFileType,
  ): Promise<void> {
    await this.dataService.uploadFile(file, type);
  }

  @Get('file/*')
  async getFile(@Param() filePath: string, @Res() res: Response) {
    return this.dataService.readFile(filePath[0], res);
  }
}
