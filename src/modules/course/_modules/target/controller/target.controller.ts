import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { TargetService } from '../service/target.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { TargetDto } from '../dto/target.dto';

@Controller('target')
export class TargetController {
  constructor(private readonly targetService: TargetService) {}
  @Get(':id')
  async findByCourse(@Param('id') id: number) {
    return this.targetService.findByByCourse(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() { payload }: { payload: TargetDto[] },
  ) {
    return this.targetService.update(id, payload);
  }
}
