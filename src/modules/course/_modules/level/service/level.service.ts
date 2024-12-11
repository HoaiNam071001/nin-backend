import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from '../entity/level.entity';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { LevelDto } from '../dto/level.dto';
import { CustomNotFoundException } from '../../../../../common/exceptions/http/custom-not-found.exception';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  async findByById(id: number): Promise<Level> {
    const level = await this.levelRepository.findOne({
      where: { id },
    });
    if (!level) {
      throw new CustomNotFoundException('Level not found');
    }
    return level;
  }

  async findAll(): Promise<LevelDto[]> {
    const levels = await this.levelRepository.find();
    return plainToClass(LevelDto, levels);
  }
}
