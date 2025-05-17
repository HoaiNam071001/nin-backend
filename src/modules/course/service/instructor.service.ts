import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { ShortUser } from '../../user/dto/user.dto';
import { User } from '../../user/entity/user.entity';
import { InstructorDto, InstructorPayloadDto } from '../dto/instructor.dto';
import { Instructor } from '../entity/instructor.entity';
@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
  ) {}

  async add(courseId: number, payload: InstructorPayloadDto) {
    if (!courseId || !payload?.userId) {
      throw new BadRequestException('Missing');
    }
    const exist = await this.instructorRepository.findOne({
      where: { course: { id: courseId }, user: { id: payload.userId } },
    });
    if (exist) {
      throw new BadRequestException('Instructor already exists');
    }
    const instructor = await this.instructorRepository.create({
      user: { id: payload.userId },
      course: { id: courseId },
      accessType: payload.accessType,
      type: payload.type,
    });
    await this.instructorRepository.save(instructor);
    const _saved = await this.instructorRepository.findOne({
      where: { course: { id: courseId }, user: { id: payload.userId } },
      relations: ['user'],
    });
    return plainToClass(InstructorDto, {
      ..._saved,
      user: plainToClass(ShortUser, _saved.user),
    });
  }

  async update(id: number, payload: InstructorPayloadDto) {
    if (!id || !payload?.userId) {
      throw new BadRequestException('Missing');
    }
    const item = await this.instructorRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!item) {
      throw new BadRequestException('Instructor not found');
    }
    await this.instructorRepository.update(id, payload); // Cập nhật thông tin người dùng
    const newItem = await this.instructorRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return plainToClass(InstructorDto, {
      ...newItem,
      user: plainToClass(ShortUser, newItem.user),
    });
  }

  async getByCourse(courseId: number) {
    const instructors = await this.instructorRepository.find({
      where: { course: { id: courseId } },
      relations: ['user'],
    });
    return plainToClass(
      InstructorDto,
      instructors.map((e) => ({ ...e, user: plainToClass(ShortUser, e.user) })),
    );
  }

  async remove(user: User, id: number): Promise<void> {
    await this.instructorRepository.delete(id);
  }
}
