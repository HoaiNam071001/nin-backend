import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entity/user-role.entity';
import { Role } from '../../common/enums/roles.enum';
import { AdminUserPayloadDto } from '../user/dto/update-user.dto';
import { CreateUserDto, DashboardSubPayload } from './dashboard.dto';
import { PaymentService } from '../course/_modules/payment/payment.service';
import { ChartCourseResponse } from '../course/_modules/payment/payment.dto';

@Injectable()
export class DashboardService {
  constructor(
    private paymentService: PaymentService,
    private userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async findUsers(
    pagable: PagingRequestBase,
  ): Promise<PaginationResponseDto<User>> {
    // const where = SearchUserPayload.buildFilterQuery(payload);
    const where = {};

    const query = new PagingRequestDto<User>(pagable, [
      'email',
      'fullName',
    ]).mapOrmQuery({
      where,
      relations: ['roles'],
    });
    const [data, total] = await this.userRepository.findAndCount(query);

    return new PaginationResponseDto<User>(
      data,
      total,
      pagable.page,
      pagable.size,
    );
  }

  async create(payload: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(payload.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const { roles, ...rest } = payload;
    const user = await this.userService.create(rest, roles);

    return user;
  }

  async updateUser(id: number, payload: AdminUserPayloadDto) {
    const { roles, ...info } = payload;
    const user = await this.userService.update(id, info);
    if (!roles?.length) {
      return user;
    }
    return await this.updateRoles(id, roles);
  }

  async updateRoles(id: number, roles: Role[]): Promise<User> {
    // Lấy tất cả roles hiện tại của user
    const existingRoles = await this.userRoleRepository.find({
      where: {
        userId: id,
      },
    });

    // Chuyển danh sách roles hiện tại thành Set của roleName để so sánh dễ hơn
    const existingRoleNames = new Set(
      existingRoles.map((role) => role.roleName),
    );
    // Chuyển danh sách roles mới thành Set
    const newRoleNames = new Set(roles);

    // Tìm roles cần xóa (có trong DB nhưng không có trong danh sách mới)
    const rolesToDelete = existingRoles.filter(
      (role) => !newRoleNames.has(role.roleName),
    );

    // Tìm roles cần thêm (có trong danh sách mới nhưng không có trong DB)
    const rolesToAdd = roles.filter((role) => !existingRoleNames.has(role));

    // Xóa các roles không còn cần
    if (rolesToDelete.length > 0) {
      await this.userRoleRepository.delete(
        rolesToDelete.map((role) => role.id),
      );
    }

    // Tạo các roles mới
    const newUserRoles = rolesToAdd.map((role) =>
      this.userRoleRepository.create({
        userId: id,
        roleName: role,
      }),
    );

    // Lưu các roles mới và trả về
    if (newUserRoles.length > 0) {
      await this.userRoleRepository.save(newUserRoles);
    }

    return await this.userService.findById(id);
  }

  async switchUserStatus(id: number, active: boolean) {
    return await this.userService.update(id, { active });
  }

  async findSubscriptions(
    pagAble: PagingRequestBase,
    payload: DashboardSubPayload,
  ) {
    const { userIds, ...rest } = payload;
    const userIdsArray = Array.isArray(userIds)
      ? userIds
      : userIds !== undefined
        ? [userIds]
        : [];
    return await this.paymentService.findSubscriptionsByOwner(
      pagAble,
      rest,
      userIdsArray,
    );
  }

  async getSubscriptionGroupByDay(
    payload: DashboardSubPayload,
  ): Promise<ChartCourseResponse> {
    const { userIds, ...rest } = payload;
    const userIdsArray = Array.isArray(userIds)
      ? userIds
      : userIds !== undefined
        ? [userIds]
        : [];
    return await this.paymentService.getSubscriptionGroupByDay(
      rest,
      userIdsArray,
    );
  }
}
