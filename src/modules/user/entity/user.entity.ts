import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Course } from '../../course/entity/course.entity';
import { UserRole } from './user-role.entity';
import { Exclude } from 'class-transformer';
import { Topic } from '../../course/entity/topic.entity';

@Entity('users') // Tên bảng trong cơ sở dữ liệu
export class User {
  @PrimaryGeneratedColumn() // Tạo ID tự động
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true }) // Email
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 255, nullable: true }) // Họ
  firstName?: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true }) // Tên
  fullName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255, nullable: true }) // Tên
  lastName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 15, nullable: true }) // Số điện thoại
  phoneNumber?: string;

  @Column({ name: 'birth_day', type: 'date', nullable: true }) // Ngày sinh
  birthDay?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true }) // Tiểu sử
  bio?: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: false }) // Mật khẩu
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10); // Băm mật khẩu trước khi lưu
  }

  @OneToMany(() => Course, (course) => course.owner)
  courses: Course[];

  @OneToMany(() => UserRole, (role) => role.user)
  roles: UserRole[]; // Thêm quan hệ với UserRole

  @OneToMany(() => Topic, (role) => role.user)
  topics: Topic[];
}
