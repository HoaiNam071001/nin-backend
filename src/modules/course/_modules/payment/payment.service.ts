import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CourseSubscription,
  PaymentDetail,
  PaymentTransaction,
} from './payment.entity';
import {
  CourseSubscriptionDto,
  CourseSubType,
  CreatePaymentPayloadDto,
  CreateSubscriptionDto,
  PaymentStatus,
} from './payment.dto';
import { User } from '../../../user/entity/user.entity';
import { DefaultCurrency } from '../../../../common/enums/unit.enum';
import { plainToClass } from 'class-transformer';
import { CartService } from '../cart/cart.service';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination-response.dto';

@Injectable()
export class PaymentService {
  constructor(
    private cartService: CartService,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(PaymentDetail)
    private paymentDetailRepository: Repository<PaymentDetail>,
    @InjectRepository(CourseSubscription)
    private courseSubscriptionRepository: Repository<CourseSubscription>,
  ) {}

  // PaymentTransaction methods
  async createPaymentTransactionAndDetails(
    payload: CreatePaymentPayloadDto,
    user: User,
  ): Promise<{ transaction: PaymentTransaction; details: PaymentDetail[] }> {
    try {
      const value = this.paymentTransactionRepository.create({
        userId: user.id,
        method: payload.method,
        status: payload.status,
        paymentDate: new Date().toISOString(),
        amount: payload.courseInfo.reduce((res, cur) => res + cur.amount, 0),
        transactionUId:
          payload.transactionUId || `NIN-${user.id}-${Date.now()}`,
        currency: payload.currency || DefaultCurrency,
      });

      const transaction = await this.paymentTransactionRepository.save(value);
      const details = await Promise.all(
        payload.courseInfo.map(async (detailData) => {
          const detail = this.paymentDetailRepository.create({
            courseId: detailData.id,
            amount: detailData.amount,
            description:
              detailData.description || `Payment for course ${detailData.id}`,
            currency: payload.currency || DefaultCurrency,
            transactionId: transaction.id,
          });
          return this.paymentDetailRepository.save(detail);
        }),
      );

      if (payload.status === PaymentStatus.SUCCESS) {
        await Promise.all(
          payload.courseInfo.map(async (detailData) => {
            return this.createCourseSubscription(
              {
                courseId: detailData.id,
                expirationDate: detailData?.expirationDate,
                transactionId: transaction.id,
              },
              user.id,
            );
          }),
        );
      }
      this.cartService.clearManyCart(
        user.id,
        payload.courseInfo.map((e) => e.id),
      );
      return { transaction, details };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllTransactions(): Promise<PaymentTransaction[]> {
    return this.paymentTransactionRepository.find();
  }

  async findOneTransaction(id: number): Promise<PaymentTransaction> {
    return this.paymentTransactionRepository.findOneBy({ id });
  }

  async updateTransaction(
    id: number,
    transactionData: Partial<PaymentTransaction>,
  ): Promise<PaymentTransaction> {
    await this.paymentTransactionRepository.update(id, transactionData);
    return this.findOneTransaction(id);
  }

  async removeTransaction(id: number): Promise<void> {
    await this.paymentTransactionRepository.delete(id);
  }

  async updateTransactionStatus(
    id: number,
    status: PaymentStatus,
  ): Promise<PaymentTransaction> {
    await this.paymentTransactionRepository.update(id, { status });
    return this.findOneTransaction(id);
  }

  async updatePaymentTransactionStatusFromGateway(
    transactionUId: string,
    status: PaymentStatus,
  ): Promise<PaymentTransaction> {
    const transaction = await this.paymentTransactionRepository.findOne({
      where: { transactionUId },
    });
    if (!transaction) {
      throw new Error(`Transaction with id ${transactionUId} not found`);
    }

    await this.paymentTransactionRepository.update(transaction.id, { status });
    return this.findOneTransaction(transaction.id);
  }

  // PaymentDetail methods
  async createDetail(
    detailData: Partial<PaymentDetail>,
  ): Promise<PaymentDetail> {
    return this.paymentDetailRepository.save(detailData);
  }

  async findAllDetails(): Promise<PaymentDetail[]> {
    return this.paymentDetailRepository.find();
  }

  async findOneDetail(id: number): Promise<PaymentDetail> {
    return this.paymentDetailRepository.findOneBy({ id });
  }

  async updateDetail(
    id: number,
    detailData: Partial<PaymentDetail>,
  ): Promise<PaymentDetail> {
    await this.paymentDetailRepository.update(id, detailData);
    return this.findOneDetail(id);
  }

  async removeDetail(id: number): Promise<void> {
    await this.paymentDetailRepository.delete(id);
  }

  // CourseSubscription methods
  async createCourseSubscription(
    payload: CreateSubscriptionDto,
    userId: number,
  ): Promise<CourseSubscription> {
    if (!payload.courseId) {
      throw new BadRequestException('Missing');
    }
    const subscription = this.courseSubscriptionRepository.create({
      userId,
      courseId: payload.courseId,
      expirationDate: payload.expirationDate
        ? new Date(payload.expirationDate)
        : null,
      transactionId: payload.transactionId,
      status: CourseSubType.ACTIVE,
    });
    return this.courseSubscriptionRepository.save(subscription);
  }

  async getCourseSubscription(
    userId: number,
    courseId: number,
  ): Promise<CourseSubscriptionDto> {
    const item = await this.courseSubscriptionRepository.findOne({
      where: { userId, courseId },
    });
    return plainToClass(CourseSubscriptionDto, item);
  }

  async findSubscriptionsByUser(user: User, pagAble: PagingRequestBase) {
    const query = new PagingRequestDto<CourseSubscription>(pagAble, [
      'course.name',
    ]).mapOrmQuery({
      relations: ['course', 'course.topics'],
      where: {
        userId: user.id,
        status: In([CourseSubType.ACTIVE]),
      },
    });
    const [courses, total] =
      await this.courseSubscriptionRepository.findAndCount(query);

    return new PaginationResponseDto<CourseSubscription>(
      courses,
      total,
      pagAble.page,
      pagAble.size,
    );
  }

  // async cancelCourseSubscription(
  //   subscriptionId: number,
  // ): Promise<CourseSubscription> {
  //   await this.courseSubscriptionRepository.update(subscriptionId, {
  //     status: CourseSubType.CANCELLED,
  //   });
  //   return this.courseSubscriptionRepository.findOneBy({ id: subscriptionId });
  // }

  // async expireCourseSubscriptions(): Promise<void> {
  //   const subscriptions = await this.courseSubscriptionRepository.find({
  //     where: {
  //       expirationDate: LessThanOrEqual(new Date()),
  //       status: CourseSubType.ACTIVE,
  //     },
  //   });

  //   await Promise.all(
  //     subscriptions.map(async (subscription) => {
  //       await this.courseSubscriptionRepository.update(subscription.id, {
  //         status: CourseSubType.EXPIRED,
  //       });
  //     }),
  //   );
  // }

  // Refund method
  // async processRefund(
  //   transactionId: number,
  //   refundAmount: number,
  // ): Promise<{
  //   refundTransaction: PaymentTransaction;
  //   updatedDetails: PaymentDetail[];
  // }> {
  //   const transaction = await this.paymentTransactionRepository.findOneBy({
  //     id: transactionId,
  //   });
  //   if (!transaction) {
  //     throw new Error(`Transaction with id ${transactionId} not found`);
  //   }

  //   // Tạo giao dịch hoàn tiền
  //   const refundTransaction = await this.paymentTransactionRepository.save({
  //     userId: transaction.userId,
  //     amount: refundAmount,
  //     paymentDate: new Date(),
  //     method: transaction.method,
  //     status: PaymentStatus.SUCCESS, // Hoặc một trạng thái phù hợp
  //     transactionId: `REFUND-${transaction.transactionUId}`, // Tạo ID giao dịch hoàn tiền
  //     currency: transaction.currency,
  //   });

  //   // Cập nhật chi tiết thanh toán
  //   const updatedDetails = await Promise.all(
  //     this.paymentDetailRepository
  //       .find({ where: { transactionId } })
  //       .map(async (detail) => {
  //         // Giảm số tiền thanh toán
  //         detail.amount -=
  //           refundAmount /
  //           (await this.paymentDetailRepository.count({
  //             where: { transactionId },
  //           }));
  //         return this.paymentDetailRepository.save(detail);
  //       }),
  //   );

  //   return { refundTransaction, updatedDetails };
  // }
}
