import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination-response.dto';
import { NotificationPayload, NotificationStatus } from './notification.dto';
import { NotificationModel } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationModel)
    private notificationsRepository: Repository<NotificationModel>,
  ) {}

  async create(payload: NotificationPayload): Promise<NotificationModel> {
    const notification = this.notificationsRepository.create(payload);
    return this.notificationsRepository.save(notification);
  }

  async find(
    userId: number,
    pagAble: PagingRequestBase,
  ): Promise<PaginationResponseDto<NotificationModel>> {
    const query = new PagingRequestDto<NotificationModel>(
      {
        ...pagAble,
        sort: ['createdAt:desc'],
      },
      ['name'],
    ).mapOrmQuery({
      where: { userId },
    });
    query.relations = ['user', 'sender', 'course'];

    const [notifications, total] =
      await this.notificationsRepository.findAndCount(query);

    return new PaginationResponseDto<NotificationModel>(
      notifications.map((e) => plainToClass(NotificationModel, e)),
      total,
      pagAble.page,
      pagAble.size,
    );
  }

  async findOne(id: number): Promise<NotificationModel> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
      relations: ['user', 'sender', 'course'],
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async countUnread(userId: number): Promise<number> {
    const count = await this.notificationsRepository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
    return count;
  }

  async update(
    id: number,
    updateNotificationDto: NotificationPayload,
  ): Promise<NotificationModel> {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async readAll(userId: number): Promise<boolean> {
    const result = await this.notificationsRepository.update(
      { userId },
      { status: NotificationStatus.READ },
    );
    return result.affected > 0;
  }

  async remove(id: number): Promise<void> {
    const result = await this.notificationsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }
}
