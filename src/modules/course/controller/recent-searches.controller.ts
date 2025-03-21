import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RecentSearchesService } from '../service/recent-searches.service';
import { CreateRecentSearchDto } from '../dto/recent-search.dto';
import { RecentSearch } from '../entity/recent-searches.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthRequest } from '../../../common/interfaces';

@UseGuards(JwtAuthGuard)
@Controller('recent-searches')
export class RecentSearchesController {
  constructor(private readonly recentSearchesService: RecentSearchesService) {}

  @Post()
  create(
    @Req() { user }: AuthRequest,
    @Body() createRecentSearchDto: CreateRecentSearchDto,
  ): Promise<RecentSearch> {
    return this.recentSearchesService.create(user.id, createRecentSearchDto);
  }

  @Get()
  findByUserId(@Req() { user }: AuthRequest): Promise<RecentSearch[]> {
    return this.recentSearchesService.findByUserId(user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecentSearchDto: CreateRecentSearchDto,
  ): Promise<RecentSearch> {
    return this.recentSearchesService.update(id, updateRecentSearchDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.recentSearchesService.remove(id);
  }
}
