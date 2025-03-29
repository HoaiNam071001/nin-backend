import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PagingRequestBase } from '../../../../common/dto/pagination-request.dto';
import { AuthRequest } from '../../../../common/interfaces';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { NotificationPayload } from './notification.dto';
import { NotificationModel } from './notification.entity';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() payload: NotificationPayload): Promise<NotificationModel> {
    return this.notificationsService.create(payload);
  }

  @Get()
  findAll(@Req() { user }: AuthRequest, @Query() paging: PagingRequestBase) {
    return this.notificationsService.find(user.id, paging);
  }

  @Get('/count')
  countUnRead(@Req() { user }: AuthRequest): Promise<number> {
    return this.notificationsService.countUnread(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<NotificationModel> {
    return this.notificationsService.findOne(id);
  }

  @Put()
  updateReadAll(@Req() { user }: AuthRequest) {
    return this.notificationsService.readAll(user.id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: NotificationPayload,
  ): Promise<NotificationModel> {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.notificationsService.remove(id);
  }
}
