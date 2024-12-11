import { Controller, Get } from '@nestjs/common';
import { LevelService } from '../service/level.service';

@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}
  @Get()
  async findAll() {
    return this.levelService.findAll();
  }
}
