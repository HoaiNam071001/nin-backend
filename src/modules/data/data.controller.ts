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

  // @Get('file/*')
  // async getFile(@Param() filePath: string, @Res() res: Response) {
  //   return this.dataService.readVideoFile(filePath[0], res);
  // }

  // @Get('file/*')
  // async readFile(
  //   @Param() hdfsFilePath: string,
  //   @Res() res: Response,
  //   @Req() req: Request, // Use @Req() to access the request object
  // ) {
  //   this.dataService.getSegment(hdfsFilePath[0], req, res);
  // }
}
