// src/course/dto/discount.dto.ts

import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';

export class DiscountPayloadDto {
  @IsNumber()
  courseId: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsIn(['percent', 'amount'])
  discountType: 'percent' | 'amount';

  startDate: Date;

  endDate: Date;

  @IsOptional()
  @IsString()
  discountCode?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class DiscountDto extends DiscountPayloadDto {
  @IsNumber()
  id: number;
}
