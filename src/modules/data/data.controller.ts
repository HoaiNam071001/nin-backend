import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Get,
  Param,
} from '@nestjs/common';
import { DataService } from './data.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' là tên field trong form
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const hdfsFilePath = `/upload/file/${file.originalname}`; // Đường dẫn lưu trên HDFS
    console.log(file, hdfsFilePath);

    if (!file) {
      throw new Error('Không có file nào được gửi!');
    }

    // Gọi service để upload file lên HDFS
    return await this.dataService.uploadFile(file, hdfsFilePath);
  }

  @Get('video/:filePath')
  async getVideo(@Param('filePath') filePath: string, @Res() res: Response) {
    try {
      const videoStream = await this.dataService.streamVideo(
        `/upload/file/${filePath}`,
      );
      res.setHeader('Content-Type', 'video/mov');
      res.setHeader('Accept-Ranges', 'bytes'); // Cho phép người dùng tạm dừng và tiếp tục video
      res.setHeader('Content-Disposition', 'inline'); // Không yêu cầu download
      videoStream.pipe(res); // Stream video đến client
    } catch (error) {
      console.error('Lỗi khi lấy video:', error); // Log lỗi
      res.status(500).send('Lỗi khi lấy video');
    }
  }
}
