import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSubscription } from '../entity/subscription.entity';
import { User } from '../../../../user/entity/user.entity';

@Injectable()
export class CourseSubscriptionService {
  constructor(
    @InjectRepository(CourseSubscription)
    private readonly courseSubscriptionRepo: Repository<CourseSubscription>,
  ) {}

  async findAll(): Promise<CourseSubscription[]> {
    return this.courseSubscriptionRepo.find({ relations: ['user', 'course'] });
  }

  async findByUser(user: User): Promise<CourseSubscription[]> {
    return this.courseSubscriptionRepo.find({
      where: { user },
      relations: ['course'],
    });
  }

  //   async subscribe(
  //     user: User,
  //     courseId: string,
  //     accessType: string,
  //     expireDate?: Date,
  //   ) {
  //     const subscription = this.courseSubscriptionRepo.create({
  //       user: {id : user.id },
  //       course: { id: courseId },
  //       access_type: accessType,
  //       expire_date: expireDate,
  //     });
  //     return this.courseSubscriptionRepo.save(subscription);
  //   }
}
