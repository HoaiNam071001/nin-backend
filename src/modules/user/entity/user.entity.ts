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
import { NFile } from '../../file/entity/file.entity';
import { Topic } from '../../course/_modules/topic/entity/topic.entity';
import { AIConversation, AIMessage } from '../../ai/entity/chatbot.entity';
import {
  CourseSubscription,
  PaymentTransaction,
} from '../../course/_modules/payment/payment.entity';
import { CartItem } from '../../course/_modules/cart/cart.entity';
import { Instructor } from '../../course/entity/instructor.entity';

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

  @OneToMany(() => NFile, (file) => file.user)
  files: NFile[];

  @OneToMany(() => CourseSubscription, (sub) => sub.user)
  courseSubscriptions: CourseSubscription[];

  @OneToMany(() => Instructor, (sub) => sub.user)
  instructors: Instructor[];

  @OneToMany(() => AIMessage, (sub) => sub.user)
  messages: AIMessage[];

  @OneToMany(() => AIConversation, (sub) => sub.user)
  conversations: AIConversation[];

  @OneToMany(() => CartItem, (sub) => sub.course)
  cartItems: CartItem[];

  @OneToMany(() => PaymentTransaction, (sub) => sub.user)
  transactions: PaymentTransaction[];
}
