import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PagingRequestBase } from '../../common/dto/pagination-request.dto';
import { AuthRequest } from '../../common/interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ChartCoursePayload,
  CourseSubscriptionDto,
  CreatePaymentPayloadDto,
  CreateSubscriptionDto,
  PaymentStatus,
} from './payment.dto';
import {
  CourseSubscription,
  PaymentDetail,
  PaymentTransaction,
} from './payment.entity';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('notify')
  async handleNotify(@Body() notifyData: any) {
    console.log('result', notifyData);
    return this.paymentService.subscriptionByTransaction(
      notifyData.orderId,
      notifyData.resultCode === 0
        ? PaymentStatus.SUCCESS
        : PaymentStatus.FAILED,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('transactions')
  async createTransaction(
    @Req() { user }: AuthRequest,
    @Body() payload: CreatePaymentPayloadDto,
  ) {
    return this.paymentService.pay(payload, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async findAllTransactions(): Promise<PaymentTransaction[]> {
    return this.paymentService.findAllTransactions();
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions/:id')
  async findOneTransaction(
    @Param('id') id: number,
  ): Promise<PaymentTransaction> {
    return this.paymentService.findOneTransaction(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('transactions/:id')
  async updateTransaction(
    @Param('id') id: number,
    @Body() transactionData: Partial<PaymentTransaction>,
  ): Promise<PaymentTransaction> {
    return this.paymentService.updateTransaction(id, transactionData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('transactions/:id')
  async removeTransaction(@Param('id') id: number): Promise<void> {
    return this.paymentService.removeTransaction(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('transactions/:id/status')
  async updateTransactionStatus(
    @Param('id') id: number,
    @Body('status') status: PaymentStatus,
  ): Promise<PaymentTransaction> {
    return this.paymentService.updateTransactionStatus(id, status);
  }

  @UseGuards(JwtAuthGuard)
  // PaymentDetail APIs
  @Post('details')
  async createDetail(
    @Body() detailData: Partial<PaymentDetail>,
  ): Promise<PaymentDetail> {
    return this.paymentService.createDetail(detailData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('details')
  async findAllDetails(): Promise<PaymentDetail[]> {
    return this.paymentService.findAllDetails();
  }

  @UseGuards(JwtAuthGuard)
  @Get('details/:id')
  async findOneDetail(@Param('id') id: number): Promise<PaymentDetail> {
    return this.paymentService.findOneDetail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('details/:id')
  async updateDetail(
    @Param('id') id: number,
    @Body() detailData: Partial<PaymentDetail>,
  ): Promise<PaymentDetail> {
    return this.paymentService.updateDetail(id, detailData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('details/:id')
  async removeDetail(@Param('id') id: number): Promise<void> {
    return this.paymentService.removeDetail(id);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/owner')
  async getSubscriptionByOwner(
    @Req() { user }: AuthRequest,
    @Query() paging: PagingRequestBase,
    @Query() payload: ChartCoursePayload,
  ) {
    return this.paymentService.findSubscriptionsByOwner(paging, payload, [
      user.id,
    ]);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/owner/chart')
  async getSubscriptionByDay(
    @Req() { user }: AuthRequest,
    @Query() payload: ChartCoursePayload,
  ) {
    return this.paymentService.getSubscriptionGroupByDay(payload, [user.id]);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/:courseId')
  async getSubscription(
    @Req() { user }: AuthRequest,
    @Param('courseId') courseId: number,
  ): Promise<CourseSubscriptionDto> {
    return this.paymentService.getCourseSubscription(user.id, courseId);
  }
}
