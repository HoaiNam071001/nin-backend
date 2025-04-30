import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AIConversation, AIMessage } from '../../ai/entity/chatbot.entity';
import { CartItem } from '../../course/_modules/cart/cart.entity';
import { CourseComment } from '../../course/_modules/comment/entity/comment.entity';
import { CourseRating } from '../../course/_modules/rating/course-rating.entity';
import { SectionProgress } from '../../course/_modules/section/entity/section.entity';
import { Topic } from '../../course/_modules/topic/entity/topic.entity';
import { Course, CourseProgress } from '../../course/entity/course.entity';
import { Instructor } from '../../course/entity/instructor.entity';
import { RecentSearch } from '../../course/entity/recent-searches.entity';
import { NFile } from '../../file/entity/file.entity';
import { UserRole } from './user-role.entity';
import { CourseSubscription, PaymentTransaction } from '../../payment/payment.entity';

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
  birthDay?: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // Tiểu sử
  bio?: string;

  @Column({ type: 'boolean', default: true })
  active?: boolean;

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

  @OneToMany(() => CourseComment, (sub) => sub.user)
  courseComments: CourseComment[];

  @OneToMany(() => RecentSearch, (sub) => sub.user)
  recentSearches: RecentSearch[];

  @OneToMany(() => CourseRating, (sub) => sub.user)
  courseRatings: CourseRating[];

  @OneToMany(() => SectionProgress, (sub) => sub.user)
  sectionProgresses: SectionProgress[];

  @OneToMany(() => CourseProgress, (sub) => sub.user)
  courseProgresses: CourseProgress[];
}
