import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { SignupDto } from '../auth/dto/signup.dto';
import { UserRole } from './entity/user-role.entity';
import { plainToClass } from 'class-transformer';
import { Role } from '../../common/enums/roles.enum';
import { SearchUserPayload, ShortUser } from './dto/user.dto';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../common/dto/pagination-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  // Tạo người dùng mới
  async create(createUserDto: SignupDto, roles?: Role[]): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);
    await this.createUserRole(savedUser.id, roles);
    return await this.findById(savedUser.id);
  }

  // Lấy người dùng theo ID
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    return plainToClass(User, user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
    return user;
  }

  // Cập nhật thông tin người dùng
  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  // Xóa người dùng
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id); // Xóa người dùng theo ID
  }

  async getUserRoles(userId: number): Promise<UserRole[]> {
    return await this.userRoleRepository.find({ where: { userId } }); // Giả sử có trường userId trong bảng userRole
  }

  async getUserRoleByUser(id: number, roleName: Role): Promise<UserRole> {
    return await this.userRoleRepository.findOne({ where: { id, roleName } }); // Giả sử có trường userId trong bảng userRole
  }

  // Role
  async createUserRole(id: number, roles?: Role[]): Promise<UserRole> {
    if (!roles?.length) {
      const userRole = this.userRoleRepository.create({
        userId: id,
        roleName: Role.STUDENT,
      });
      const roleRes = await this.userRoleRepository.save(userRole);
      return roleRes;
    }

    const newUserRoles = roles.map((role) =>
      this.userRoleRepository.create({
        userId: id,
        roleName: role,
      }),
    );

    // Lưu các roles mới và trả về
    if (newUserRoles.length > 0) {
      await this.userRoleRepository.save(newUserRoles);
    }
  }

  async addRoleToUser(userId: number, role: Role) {
    const user = await this.findById(userId);
    if (user.roles.some((e) => e.roleName === role)) {
      return user;
    }

    await this.createUserRole(userId, [role]);
    const _user = await this.findById(userId);
    return _user;
  }

  async find(
    pagable: PagingRequestBase,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: SearchUserPayload,
  ): Promise<PaginationResponseDto<ShortUser>> {
    // const where = SearchUserPayload.buildFilterQuery(payload);
    const where = {};

    const query = new PagingRequestDto<User>(pagable, [
      'email',
      'fullName',
    ]).mapOrmQuery({
      where,
    });
    const [data, total] = await this.usersRepository.findAndCount(query);

    return new PaginationResponseDto<ShortUser>(
      data.map((e) => ({
        ...plainToClass(ShortUser, e),
      })),
      total,
      pagable.page,
      pagable.size,
    );
  }
}
