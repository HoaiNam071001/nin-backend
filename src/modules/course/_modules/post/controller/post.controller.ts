import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PostService } from '../service/post.service';
import { AuthRequest } from '../../../../../common/interfaces';
import { PostDto, UpdatePostDto } from '../dto/post.dto';

@UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('/section/:sectionId')
  async addVideo(
    @Req() { user }: AuthRequest,
    @Param('sectionId') id: number,
    @Body() payload: UpdatePostDto,
  ): Promise<PostDto> {
    return this.postService.updateBySection(id, payload, user);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<PostDto> {
    return this.postService.findBySection(id);
  }
}
