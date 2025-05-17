import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PagingRequestBase } from '../../common/dto/pagination-request.dto';
import { AdminUserPayloadDto } from '../user/dto/update-user.dto';
import { CreateUserDto, DashboardSubPayload } from './dashboard.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('users')
  findAll(@Query() paging: PagingRequestBase) {
    return this.dashboardService.findUsers(paging);
  }

  @Post('user')
  createUser(@Body() payload: CreateUserDto) {
    return this.dashboardService.create(payload);
  }

  @Put('user/status/:id')
  switchUserStatus(@Param('id') id: number, @Body('active') active: boolean) {
    return this.dashboardService.switchUserStatus(id, active);
  }

  @Put('user/:id')
  updateRoles(@Param('id') id: number, @Body() request: AdminUserPayloadDto) {
    return this.dashboardService.updateUser(id, request);
  }

  @Get('course-report')
  async getSubscriptionByOwner(
    @Query() paging: PagingRequestBase,
    @Query() payload: DashboardSubPayload,
  ) {
    return this.dashboardService.findSubscriptions(paging, payload);
  }

  @Get('course-report/chart')
  async getSubscriptionByDay(@Query() payload: DashboardSubPayload) {
    return this.dashboardService.getSubscriptionGroupByDay(payload);
  }

  @Get('system-info')
  async systemInfo() {
    return this.dashboardService.getReport();
  }

  @Get('user-file-count')
  async fileCountByUser() {
    return this.dashboardService.getChartFileByUser();
  }
}
