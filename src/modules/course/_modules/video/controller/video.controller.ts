import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { VideoService } from '../service/video.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthRequest } from '../../../../../common/interfaces';
import { VideoDto } from '../dto/video.dto';
@UseGuards(JwtAuthGuard)
@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('/section/:sectionId')
  @UseInterceptors(FileInterceptor('file'))
  async addVideo(
    @UploadedFile() file: Express.Multer.File,
    @Req() { user }: AuthRequest,
    @Param('sectionId') sectionId: number,
    @Body('duration') duration?: string,
  ): Promise<VideoDto> {
    return this.videoService.updateBySection({
      sectionId,
      file,
      user,
      duration: +duration,
    });
  }

  @Get(':id')
  async findBySection(@Param('id') id: number): Promise<VideoDto> {
    return this.videoService.findBySection(id);
  }

  @Delete(':id')
  async removeVideo(@Param('id') id: number): Promise<VideoDto> {
    return this.videoService.remove(id);
  }
}
