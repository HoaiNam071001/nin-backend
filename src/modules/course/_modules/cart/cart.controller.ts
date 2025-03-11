// src/cart/cart.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItem } from './cart.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AuthRequest } from '../../../../common/interfaces';

@UseGuards(JwtAuthGuard) // Bảo vệ tất cả các route trong controller này
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('/items/:courseId') // Lưu ý bỏ userId ra khỏi path
  async addItem(
    @Req() { user }: AuthRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<CartItem> {
    return this.cartService.addItem(user.id, courseId);
  }

  @Get('/items') // Lưu ý bỏ userId ra khỏi path
  async getCartItems(@Req() { user }: AuthRequest): Promise<CartItem[]> {
    return this.cartService.getCartItems(user.id);
  }

  @Delete('/items/:id')
  async removeItem(
    @Req() { user }: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.cartService.removeItem(id);
  }

  @Put('/items/:courseId') // Lưu ý bỏ userId ra khỏi path
  async updateQuantity(
    @Req() { user }: AuthRequest,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<CartItem> {
    return this.cartService.updateQuantity(user.id, courseId, quantity);
  }

  @Put('/items/:itemId/quantity')
  async updateQuantityById(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body('quantity', ParseIntPipe) quantity: number,
  ): Promise<CartItem> {
    return this.cartService.updateQuantityById(itemId, quantity);
  }

  @Delete('/clear')
  async clearCart(@Req() { user }: AuthRequest): Promise<void> {
    return this.cartService.clearCart(user.id);
  }
}
