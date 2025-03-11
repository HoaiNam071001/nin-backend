import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CourseSubscription,
  PaymentDetail,
  PaymentTransaction,
} from './payment.entity';
import {
  CourseSubscriptionDto,
  CreatePaymentPayloadDto,
  CreateSubscriptionDto,
  PaymentStatus,
} from './payment.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AuthRequest } from '../../../../common/interfaces';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // PaymentTransaction APIs
  @Post('transactions')
  async createTransaction(
    @Req() { user }: AuthRequest,
    @Body() payload: CreatePaymentPayloadDto,
  ): Promise<{ transaction: PaymentTransaction; details: PaymentDetail[] }> {
    return this.paymentService.createPaymentTransactionAndDetails(
      payload,
      user,
    );
  }

  @Get('transactions')
  async findAllTransactions(): Promise<PaymentTransaction[]> {
    return this.paymentService.findAllTransactions();
  }

  @Get('transactions/:id')
  async findOneTransaction(
    @Param('id') id: number,
  ): Promise<PaymentTransaction> {
    return this.paymentService.findOneTransaction(id);
  }

  @Put('transactions/:id')
  async updateTransaction(
    @Param('id') id: number,
    @Body() transactionData: Partial<PaymentTransaction>,
  ): Promise<PaymentTransaction> {
    return this.paymentService.updateTransaction(id, transactionData);
  }

  @Delete('transactions/:id')
  async removeTransaction(@Param('id') id: number): Promise<void> {
    return this.paymentService.removeTransaction(id);
  }

  @Put('transactions/:id/status')
  async updateTransactionStatus(
    @Param('id') id: number,
    @Body('status') status: PaymentStatus,
  ): Promise<PaymentTransaction> {
    return this.paymentService.updateTransactionStatus(id, status);
  }

  // PaymentDetail APIs
  @Post('details')
  async createDetail(
    @Body() detailData: Partial<PaymentDetail>,
  ): Promise<PaymentDetail> {
    return this.paymentService.createDetail(detailData);
  }

  @Get('details')
  async findAllDetails(): Promise<PaymentDetail[]> {
    return this.paymentService.findAllDetails();
  }

  @Get('details/:id')
  async findOneDetail(@Param('id') id: number): Promise<PaymentDetail> {
    return this.paymentService.findOneDetail(id);
  }

  @Put('details/:id')
  async updateDetail(
    @Param('id') id: number,
    @Body() detailData: Partial<PaymentDetail>,
  ): Promise<PaymentDetail> {
    return this.paymentService.updateDetail(id, detailData);
  }

  @Delete('details/:id')
  async removeDetail(@Param('id') id: number): Promise<void> {
    return this.paymentService.removeDetail(id);
  }

  // CourseSubscription APIs
  @Post('subscriptions')
  async createSubscription(
    @Req() { user }: AuthRequest,
    @Body() subscriptionData: CreateSubscriptionDto,
  ): Promise<CourseSubscription> {
    return this.paymentService.createCourseSubscription(
      subscriptionData,
      user.id,
    );
  }

  @Get('subscriptions/:courseId')
  async getSubscription(
    @Req() { user }: AuthRequest,
    @Param('courseId') courseId: number,
  ): Promise<CourseSubscriptionDto> {
    return this.paymentService.getCourseSubscription(user.id, courseId);
  }

  // @Put('subscriptions/:id/extend')
  // async extendSubscription(
  //   @Param('id') id: number,
  //   @Body('expirationDate') expirationDate: Date,
  // ): Promise<CourseSubscription> {
  //   return this.paymentService.extendCourseSubscription(id, expirationDate);
  // }

  // @Put('subscriptions/:id/cancel')
  // async cancelSubscription(
  //   @Param('id') id: number,
  // ): Promise<CourseSubscription> {
  //   return this.paymentService.cancelCourseSubscription(id);
  // }

  // @Post('courses/:courseId/free-subscriptions/:userId')
  // async createFreeSubscription(
  //   @Param('courseId') courseId: number,
  //   @Param('userId') userId: number,
  // ): Promise<CourseSubscription> {
  //   const subscriptionData: Partial<CourseSubscription> = {
  //     courseId,
  //     userId,
  //   };
  //   return this.paymentService.createFreeCourseSubscription(subscriptionData);
  // }
  // APIs bổ sung (nếu cần)
  // ...
}
