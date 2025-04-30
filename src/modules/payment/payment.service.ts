import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Between, DataSource, In, Repository } from 'typeorm';
import {
  ChartCoursePayload,
  ChartCourseResponse,
  CourseSubscriptionDto,
  CourseSubType,
  CreatePaymentPayloadDto,
  CreateSubscriptionDto,
  PaymentStatus,
} from './payment.dto';
import {
  CourseSubscription,
  PaymentDetail,
  PaymentTransaction,
} from './payment.entity';
import { NotificationsService } from '../user/modules/notifications/notifications.service';
import { CartService } from '../course/_modules/cart/cart.service';
import { Course } from '../course/entity/course.entity';
import { User } from '../user/entity/user.entity';
import { Currency, DefaultCurrency } from '../../common/enums/unit.enum';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto';
import { NotificationType } from '../user/modules/notifications/notification.dto';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../common/dto/pagination-request.dto';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
    private dataSource: DataSource,
    @Inject(forwardRef(() => CartService))
    private cartService: CartService,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(PaymentDetail)
    private paymentDetailRepository: Repository<PaymentDetail>,
    @InjectRepository(CourseSubscription)
    private courseSubscriptionRepository: Repository<CourseSubscription>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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
    const course = await this.courseRepository.findOne({
      where: {
        id: payload.courseId,
      },
    });
    if (!course) {
      throw new BadRequestException('Course not found');
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
    const sub = await this.courseSubscriptionRepository.save(subscription);

    this.notificationsService.create({
      type: NotificationType.COURSE_SUBSCRIPTION,
      userId: course.ownerId,
      senderId: userId,
      courseId: payload.courseId,
      data: {
        subscriptionId: sub.id,
      },
    });
    return sub;
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
    pagAble: PagingRequestBase,
    payload: ChartCoursePayload,
    userIds: number[] = [], // Mảng users mặc định là mảng rỗng
  ) {
    const where: any = {
      createdAt: (payload?.startDate && payload?.endDate
        ? Between(payload.startDate, payload.endDate)
        : undefined) as any,
    };

    // Nếu mảng users không rỗng, thêm điều kiện lọc theo ownerId
    if (userIds.length > 0) {
      where.course = {
        ownerId: In(userIds), // Sử dụng In để lọc nhiều ownerId
      };
    }

    const query = new PagingRequestDto<CourseSubscription>(pagAble, [
      'course.name',
    ]).mapOrmQuery({
      relations: ['course', 'course.owner', 'user', 'payment'],
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
    payload: ChartCoursePayload,
    userIds: number[] = [],
  ): Promise<ChartCourseResponse> {
    const { startDate, endDate } = payload;
    const mana = this.dataSource.manager;
    // Query lấy dữ liệu thô, không nhóm
    const query =
      userIds.length > 0
        ? `
            SELECT
              cs.created_at,
              pd.amount,
              cs.id AS subscription_id,
              c.id AS course_id
            FROM course_subscription cs
            INNER JOIN courses c
              ON cs.course_id = c.id
              AND c.owner_id IN (${userIds.map((_, i) => `$${i + 3}`).join(',')})
            LEFT JOIN payment_details pd
              ON cs.payment_id = pd.id
            WHERE cs.created_at BETWEEN $1 AND $2
            ORDER BY cs.created_at ASC;
          `
        : `
            SELECT
              cs.created_at,
              pd.amount,
              cs.id AS subscription_id,
              c.id AS course_id
            FROM course_subscription cs
            LEFT JOIN payment_details pd
              ON cs.payment_id = pd.id
            LEFT JOIN courses c
              ON cs.course_id = c.id
            WHERE cs.created_at BETWEEN $1 AND $2
            ORDER BY cs.created_at ASC;
          `;

    const params =
      userIds.length > 0
        ? [startDate, endDate, ...userIds]
        : [startDate, endDate];

    const rawData = await mana.query(query, params);

    // Nhóm dữ liệu theo ngày ở múi giờ +7
    const groupedData = new Map<
      string,
      { sales: number; s_count: Set<string>; c_count: Set<string> }
    >();

    rawData.forEach((item) => {
      // Chuyển created_at về múi giờ +7
      const dateInClientTz = new Date(
        new Date(item.created_at).getTime() + 7 * 60 * 60 * 1000,
      );
      const dateStr = dateInClientTz.toISOString().split('T')[0];

      if (!groupedData.has(dateStr)) {
        groupedData.set(dateStr, {
          sales: 0,
          s_count: new Set(),
          c_count: new Set(),
        });
      }

      const group = groupedData.get(dateStr)!;
      // Tính tổng sales
      group.sales += parseFloat(item.amount) || 0;
      // Đếm subscription (s_count)
      if (item.subscription_id) group.s_count.add(item.subscription_id);
      // Đếm course (c_count)
      if (item.course_id) group.c_count.add(item.course_id);
    });

    // Chuyển groupedData thành dataMap
    const dataMap = new Map(
      Array.from(groupedData.entries()).map(([dateStr, group]) => [
        dateStr,
        {
          date: dateStr,
          value: group.sales || 0,
          currency: Currency.VND,
          subscriptionCount: group.s_count.size,
          courseCount: group.c_count.size,
        },
      ]),
    );

    // Tạo dãy ngày từ startDate đến endDate theo múi giờ client (+7)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      result.push(
        dataMap.get(dateStr) || {
          date: dateStr,
          value: null,
          currency: Currency.VND,
          subscriptionCount: 0,
          courseCount: 0,
        },
      );
    }

    return { data: result };
  }
}
