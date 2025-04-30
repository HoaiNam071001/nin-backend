// src/cart/cart.service.ts
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentService } from '../../../payment/payment.service';
import { CartItem } from './cart.entity';

@Injectable()
export class CartService {
  constructor(
    @Inject(forwardRef(() => PaymentService))
    private paymentService: PaymentService,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async addItem(userId: number, courseId: number): Promise<CartItem> {
    const [existSub, existCart] = await Promise.all([
      this.paymentService.getCourseSubscription(userId, courseId),
      this.cartItemRepository.findOne({
        where: { user: { id: userId }, course: { id: courseId } },
      }),
    ]);

    if (existSub) {
      throw new Error('Course is already subscribed');
    }
    if (existCart) {
      return existCart;
    }

    const newItem = this.cartItemRepository.create({
      user: { id: userId },
      course: { id: courseId },
    });

    return this.cartItemRepository.save(newItem);
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    const items = await this.cartItemRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['course', 'course.discounts'],
    });
    const now = new Date(); // Lấy thời gian hiện tại
    const filteredItems = items.map((item) => {
      item.course.discounts = item.course.discounts.filter((discount) => {
        const startDate = new Date(discount.startDate); // Chuyển đổi thành Date
        const endDate = new Date(discount.endDate); // Chuyển đổi thành Date
        return endDate >= now && startDate <= now;
      });
      return item;
    });

    return filteredItems;
  }

  async removeItem(id: number): Promise<void> {
    await this.cartItemRepository.delete({ id });
  }

  async updateQuantity(
    userId: number,
    courseId: number,
    quantity: number,
  ): Promise<CartItem> {
    const item = await this.cartItemRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!item) {
      throw new Error('Item not found');
    }
    item.quantity = quantity;
    return this.cartItemRepository.save(item);
  }

  async updateQuantityById(
    itemId: number,
    quantity: number,
  ): Promise<CartItem> {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
    });
    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }
    item.quantity = quantity;
    return this.cartItemRepository.save(item);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartItemRepository.delete({ user: { id: userId } });
  }

  async clearManyCart(userId: number, courseIds: number[]): Promise<void> {
    const deletePromises = courseIds.map((courseId) =>
      this.cartItemRepository.delete({
        user: { id: userId },
        course: { id: courseId },
      }),
    );

    await Promise.all(deletePromises);
  }
}
