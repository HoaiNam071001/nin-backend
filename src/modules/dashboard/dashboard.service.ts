import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto';
import { Role } from '../../common/enums/roles.enum';
import { Course } from '../course/entity/course.entity';
import { CourseStatus } from '../course/model/course.model';
import { ChartCourseResponse } from '../payment/payment.dto';
import { PaymentService } from '../payment/payment.service';
import { AdminUserPayloadDto } from '../user/dto/update-user.dto';
import { UserRole } from '../user/entity/user-role.entity';
import { User } from '../user/entity/user.entity';
import { UserService } from '../user/user.service';
import {
  CreateUserDto,
  DashboardReport,
  DashboardSubPayload,
  DashboardUserFile,
} from './dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    private paymentService: PaymentService,
    private dataSource: DataSource,
    private userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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

  async getReport(): Promise<DashboardReport> {
    const [users, courses] = await Promise.all([
      this.getUserCount(),
      this.getCourseCount(),
    ]);
    return { users, courses };
  }

  async getUserCount() {
    const mana = this.dataSource.manager;
    const query = `
      SELECT 
          COUNT(DISTINCT u.id) AS total_users,
          COUNT(DISTINCT CASE WHEN u.active = TRUE THEN u.id END) AS active_users,
          COUNT(DISTINCT CASE WHEN u.active = FALSE THEN u.id END) AS inactive_users,
          COUNT(DISTINCT CASE WHEN ur.role_name = '${Role.STUDENT}' THEN u.id END) AS student_count,
          COUNT(DISTINCT CASE WHEN ur.role_name = '${Role.TEACHER}' THEN u.id END) AS teacher_count,
          COUNT(DISTINCT CASE WHEN ur.role_name = '${Role.EDUCATION_MANAGER}' THEN u.id END) AS education_manager_count,
          COUNT(DISTINCT CASE WHEN ur.role_name = '${Role.ADMIN}' THEN u.id END) AS admin_count
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id;
    `;
    const rawData = await mana.query(query);

    const result = rawData[0]; // Kết quả query trả về một mảng, lấy phần tử đầu tiên
    return {
      totalUsers: parseInt(result.total_users, 10),
      activeUsers: parseInt(result.active_users, 10),
      inactiveUsers: parseInt(result.inactive_users, 10),
      role: {
        [Role.STUDENT]: parseInt(result.student_count, 10),
        [Role.TEACHER]: parseInt(result.teacher_count, 10),
        [Role.EDUCATION_MANAGER]: parseInt(result.education_manager_count, 10),
        [Role.ADMIN]: parseInt(result.admin_count, 10),
      },
    };
  }

  async getCourseCount() {
    const mana = this.dataSource.manager;

    const statusCounts = Object.values(CourseStatus)
      .map((status) => {
        const columnName = `${status}_count`; // Tạo tên cột: draft_count, pending_count, ...
        return `COUNT(CASE WHEN status = '${status}' THEN 1 END) AS ${columnName}`;
      })
      .join(', ');

    const query = `
      SELECT 
          COUNT(*) AS total_courses,
          ${statusCounts}
      FROM courses;
    `;

    const rawData = await mana.query(query);

    const result = rawData[0] || {};
    const statusResult: { [key in CourseStatus]: number } = {} as {
      [key in CourseStatus]: number;
    };
    for (const status of Object.values(CourseStatus)) {
      const columnName = `${status}_count`;
      statusResult[status] = parseInt(result[columnName] || '0', 10);
    }

    return {
      totalCourses: parseInt(result.total_courses || '0', 10),
      status: statusResult,
    };
  }

  async getChartFileByUser(limit = 5): Promise<DashboardUserFile[]> {
    const mana = this.dataSource.manager;

    const query = `
        WITH TopUsers AS (
    SELECT 
        f.user_id::text as user_id, 
        SUM(f.size) as total_size_bytes,
        COUNT(*) as file_count,
        u.id as user_id_int,
        u.full_name,
        u.email,
        u.avatar
    FROM files f
    LEFT JOIN users u ON f.user_id = u.id
    GROUP BY f.user_id, u.id, u.full_name, u.email, u.avatar
    ORDER BY total_size_bytes DESC
    LIMIT $1
),
Others AS (
    SELECT 
        NULL as user_id, 
        SUM(size) as total_size_bytes,
        COUNT(*) as file_count,
        NULL::integer as user_id_int,
        NULL as full_name,
        NULL as email,
        NULL as avatar
    FROM files
    WHERE user_id NOT IN (SELECT user_id::int FROM TopUsers WHERE user_id IS NOT NULL)
)
SELECT 
    user_id, 
    total_size_bytes,
    file_count,
    user_id_int,
    full_name,
    email,
    avatar
FROM TopUsers
UNION
SELECT 
    user_id, 
    total_size_bytes,
    file_count,
    user_id_int,
    full_name,
    email,
    avatar
FROM Others
ORDER BY total_size_bytes DESC;
    `;

    const rawData = await mana.query(query, [limit]);
    return rawData
      .map((item) => ({
        size: Number(item.total_size_bytes),
        count: +item.file_count,
        user: !item?.user_id
          ? null
          : {
              id: item.user_id_int,
              fullName: item.full_name,
              email: item.email,
              avatar: item.avatar,
            },
      }))
      .filter((e) => e.size);
  }
}
