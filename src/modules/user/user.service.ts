import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { SignupDto } from '../auth/dto/signup.dto';
import { UserRole } from './entity/user-role.entity';
import { plainToClass } from 'class-transformer';
import { ESearchService } from '../elasticsearch/elasticsearch.service';
import { Role } from '../../common/enums/roles.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,

    private searchService: ESearchService,
  ) {}

  // Tạo người dùng mới
  async create(createUserDto: SignupDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto); // Tạo instance User
    const savedUser = await this.usersRepository.save(user); // Lưu vào database
    await this.createUserRole(savedUser.id, createUserDto.role);
    return await this.findById(savedUser.id);

    // await this.searchService.indexDocument(
    //   'users',
    //   savedUser.id.toString(),
    //   plainToClass(User, savedUser),
    // );
  }

  // // Lấy tất cả người dùng
  // async findAll(): Promise<User[]> {
  //   return await this.usersRepository.find(); // Trả về danh sách người dùng
  // }

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
    await this.usersRepository.update(id, updateUserDto); // Cập nhật thông tin người dùng
    await this.searchService.indexDocument('users', id.toString(), {
      ...updateUserDto,
    });
    return this.findById(id); // Trả về người dùng đã cập nhật
  }

  // Xóa người dùng
  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id); // Xóa người dùng theo ID

    // Xóa tài liệu trong Elasticsearch
    await this.searchService.deleteDocument('users', id.toString());
  }

  // Tìm kiếm người dùng với phân trang
  async searchUsersWithPagination(
    query: string,
    from: number,
    size: number,
  ): Promise<User[]> {
    const searchResults = await this.searchService.searchWithPagination(
      'users',
      { match: { query } },
      from,
      size,
    );
    return searchResults.hits.hits.map((hit) =>
      plainToClass(User, hit._source),
    ); // Chuyển đổi kết quả sang kiểu User
  }

  async getUserRoles(userId: number): Promise<UserRole[]> {
    return await this.userRoleRepository.find({ where: { userId } }); // Giả sử có trường userId trong bảng userRole
  }

  async getUserRoleByUser(id: number, roleName: Role): Promise<UserRole> {
    return await this.userRoleRepository.findOne({ where: { id, roleName } }); // Giả sử có trường userId trong bảng userRole
  }

  // Role
  async createUserRole(id: number, role: Role): Promise<UserRole> {
    const userRole = this.userRoleRepository.create({
      userId: id,
      roleName: role || Role.STUDENT,
    });
    const roleRes = await this.userRoleRepository.save(userRole);
    return roleRes;
  }

  async addRoleToUser(userId: number, role: Role) {
    const user = await this.findById(userId);
    if (user.roles.some((e) => e.roleName === role)) {
      return user;
    }

    await this.createUserRole(userId, role);
    const _user = await this.findById(userId);
    return _user;
  }
}
