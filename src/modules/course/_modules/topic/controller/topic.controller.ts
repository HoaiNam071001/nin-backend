import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TopicDto } from '../dto/topic.dto';
import { TopicService } from '../service/topic.service';
import { PagingRequestDto } from '../../../../../common/dto/pagination-request.dto';

@Controller('topic')
export class TopicController {
  constructor(private readonly categoryService: TopicService) {}
  @Get()
  async findList(@Query() paging: PagingRequestDto<TopicDto>) {
    return this.categoryService.findMany(paging);
  }

  @Post()
  async create(@Body() { name }: { name: string }) {
    return this.categoryService.create(name);
  }
}
