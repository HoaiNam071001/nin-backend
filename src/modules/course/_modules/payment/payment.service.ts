import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
import {
  CourseSubscription,
  PaymentDetail,
  PaymentTransaction,
} from './payment.entity';
import {
  ChartCoursePayload,
  ChartCourseResponse,
  CourseSubscriptionDto,
  CourseSubType,
  CreatePaymentPayloadDto,
  CreateSubscriptionDto,
  PaymentStatus,
} from './payment.dto';
import { User } from '../../../user/entity/user.entity';
import { Currency, DefaultCurrency } from '../../../../common/enums/unit.enum';
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
    private dataSource: DataSource, // Inject DataSource
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
      const exist = await this.courseSubscriptionRepository.find({
        where: {
          courseId: In(payload.courseInfo.map((info) => info.id)),
          userId: user.id,
          status: CourseSubType.ACTIVE,
        },
      });
      if (exist?.length) {
        throw new BadRequestException('User already enrolled in a course');
      }
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
          details.map(async (detailData) => {
            return this.createCourseSubscription(
              {
                courseId: detailData.courseId || detailData.course?.id,
                expirationDate: null,
                transactionId: detailData.id,
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
      relations: ['course', 'course.owner'],
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

  async findSubscriptionsByOwner(
    user: User,
    pagAble: PagingRequestBase,
    payload: ChartCoursePayload,
  ) {
    const where = {
      course: {
        ownerId: user.id,
      },
      createdAt: (payload?.startDate && payload?.endDate
        ? Between(payload.startDate, payload.endDate)
        : undefined) as any,
    };
    const query = new PagingRequestDto<CourseSubscription>(pagAble, [
      'course.name',
    ]).mapOrmQuery({
      relations: ['course', 'user', 'payment'],
      where,
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

  async getSubscriptionGroupByDay(
    user: User,
    payload: ChartCoursePayload,
  ): Promise<ChartCourseResponse> {
    const { startDate, endDate } = payload;
    const mana = this.dataSource.manager;
    const rawData = await mana.query(
      `SELECT
        DATE(cs.created_at) as date,
        SUM(pd.amount) as sales,
        COUNT(cs.id) as s_count,
        COUNT(DISTINCT c.id) as c_count
      FROM
        course_subscription cs
      JOIN
        payment_details pd ON cs.payment_id = pd.id
      JOIN
        courses c ON cs.course_id = c.id
      WHERE
        cs.created_at BETWEEN $1 AND $2
            AND c.owner_id = $3
      GROUP BY
        DATE(cs.created_at)
      ORDER BY
      date ASC;`,
      [startDate, endDate, user.id],
    );

    return {
      data: rawData.map((item) => ({
        date: item.date,
        value: parseFloat(item.sales),
        currency: Currency.VND,
        subscriptionCount: +item.s_count,
        courseCount: +item.c_count,
      })),
    };
  }
}
