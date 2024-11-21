import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from '../../../common/enums/roles.enum';

@Entity('user_roles') // Tên bảng trong cơ sở dữ liệu
export class UserRole {
  @PrimaryGeneratedColumn() // Tạo ID tự động
  id: number;

  @Column({ name: 'user_id' }) // Khóa ngoại tham chiếu đến User.Id
  userId: number;

  @Column({ name: 'role_name', type: 'varchar', length: 100 }) // Tên vai trò
  roleName: Role;

  @ManyToOne(() => User, (user) => user.roles)
  @JoinColumn({ name: 'user_id' })
  user: User; // Tham chiếu đến entity User
}
