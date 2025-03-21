import { Currency } from '../../../../common/enums/unit.enum';
import { IsNumber, IsOptional } from 'class-validator';

export interface CreatePaymentPayloadDto {
  courseInfo: {
    id: number;
    amount: number;
    description?: string;
    expirationDate?: Date;
  }[];
  method: PaymentMethod;
  status: PaymentStatus;
  currency: Currency;
  transactionUId?: string;
}

export interface CreateSubscriptionDto {
  courseId: number;
  expirationDate?: Date;
  transactionId: number;
}

export class CourseSubscriptionDto {
  @IsOptional()
  expirationDate?: Date;

  @IsOptional()
  status?: CourseSubType;

  @IsOptional()
  @IsNumber()
  transactionId?: number;
}

export interface ChartCoursePayload {
  startDate: string;
  endDate: string;
}

export interface ChartCourseResponse {
  data: {
    date: string;
    value: number;
    currency: Currency;
    subscriptionCount: number;
  }[];
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum CourseSubType {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  MOMO = 'MOMO',
  CARD = 'CARD',
  PAYPAL = 'PAYPAL',
}
