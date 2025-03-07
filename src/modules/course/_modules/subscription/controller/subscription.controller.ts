import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { CourseSubscriptionService } from '../service/subscription.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { AuthRequest } from '../../../../../common/interfaces/http.interface';

@UseGuards(JwtAuthGuard)
@Controller('course-subscriptions')
export class CourseSubscriptionController {
  constructor(
    private readonly courseSubscriptionService: CourseSubscriptionService,
  ) {}

  @Get()
  async getSubscriptions(@Req() { user }: AuthRequest) {
    return this.courseSubscriptionService.findByUser(user);
  }

  // @Post()
  // async subscribeToCourse(
  //   @Body()
  //   {
  //     userId,
  //     courseId,
  //     accessType,
  //     expireDate,
  //   }: {
  //     userId: string;
  //     courseId: string;
  //     accessType: string;
  //     expireDate?: Date;
  //   },
  // ) {
  //   return this.courseSubscriptionService.subscribe(
  //     userId,
  //     courseId,
  //     accessType,
  //     expireDate,
  //   );
  // }
}
