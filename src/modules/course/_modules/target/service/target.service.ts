import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Target } from '../entity/target.entity';
import { TargetDto } from '../dto/target.dto';
import { plainToClass } from 'class-transformer';
import { CourseTarget } from '../../../model/course.model';

@Injectable()
export class TargetService {
  constructor(
    @InjectRepository(Target)
    private readonly targetRepository: Repository<Target>,
  ) {}

  async findByByCourse(id: number): Promise<Target[]> {
    const targets = await this.targetRepository.find({
      where: { courseId: id },
    });

    return targets;
  }

  async update(id: number, payload: TargetDto[]): Promise<TargetDto[]> {
    const targets = await this.findByByCourse(id);

    const updateOrCreateTarget = (type: CourseTarget): Promise<Target> => {
      const newTarget = payload.find((e) => e.type === type);
      const existingTarget = targets.find((e) => e.type === type);

      if (newTarget) {
        if (existingTarget) {
          Object.assign(existingTarget, newTarget);
          return this.targetRepository.save({
            courseId: id,
            ...existingTarget,
          });
        } else {
          const createdTarget = this.targetRepository.create(newTarget);
          return this.targetRepository.save({
            courseId: id,
            ...createdTarget,
          });
        }
      } else {
        if (existingTarget) {
          return this.targetRepository.remove(existingTarget);
        }
      }
      return Promise.resolve(null);
    };

    await Promise.all([
      updateOrCreateTarget(CourseTarget.object),
      updateOrCreateTarget(CourseTarget.requirement),
      updateOrCreateTarget(CourseTarget.achieved),
    ]);

    return plainToClass(TargetDto, await this.findByByCourse(id));
  }
}
