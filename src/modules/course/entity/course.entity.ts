import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NFile } from '../../file/entity/file.entity';
import {
  CourseSubscription,
  PaymentDetail,
} from '../../payment/payment.entity';
import { User } from '../../user/entity/user.entity';
import { NotificationModel } from '../../user/modules/notifications/notification.entity';
import { CartItem } from '../_modules/cart/cart.entity';
import { Category } from '../_modules/category/entity/category.entity';
import { CourseComment } from '../_modules/comment/entity/comment.entity';
import { Level } from '../_modules/level/entity/level.entity';
import { CourseRating } from '../_modules/rating/course-rating.entity';
import { Section } from '../_modules/section/entity/section.entity';
import { Target } from '../_modules/target/entity/target.entity';
import { CourseTopic } from '../_modules/topic/entity/topic.entity';
import { CourseStatus } from '../model/course.model';
import { Discount } from './discount.entity';
import { Instructor } from './instructor.entity';
@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'float', nullable: true, default: 0 })
  price?: number;

  @Column({ type: 'varchar', length: 3, default: 'VND' })
  currency?: string;

  @Column({ name: 'estimated_time', type: 'int', nullable: true })
  estimatedTime?: number;

  @Column({ name: 'owner_id', type: 'int', nullable: true })
  ownerId?: number;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId?: number;

  @Column({ name: 'sub_category_id', type: 'int', nullable: true })
  subCategoryId?: number;

  @Column({ name: 'level_id', type: 'int', nullable: true })
  levelId?: number;

  @Column({ type: 'varchar', enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //
  @ManyToOne(() => User, (user) => user.courses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Category, (category) => category.courses, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Category, (category) => category.courses, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: Category;

  @ManyToOne(() => Level, (level) => level.courses, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @Exclude()
  @OneToMany(() => CourseTopic, (courseTopic) => courseTopic.course)
  topics: CourseTopic[];

  @OneToMany(() => NFile, (file) => file.course)
  files: NFile[];

  @OneToMany(() => Section, (section) => section.course)
  sections: Section[];

  @OneToMany(() => CourseSubscription, (sub) => sub.course)
  subscriptions: CourseSubscription[];

  @OneToMany(() => Instructor, (sub) => sub.course)
  instructors: Instructor[];

  @OneToMany(() => Target, (sub) => sub.course)
  targets: Target[];

  @OneToMany(() => Discount, (sub) => sub.course)
  discounts: Discount[];

  @OneToMany(() => CartItem, (sub) => sub.course)
  cartItems: CartItem[];

  @OneToMany(() => PaymentDetail, (sub) => sub.transaction)
  paymentDetails: PaymentDetail[];

  @OneToMany(() => CourseComment, (sub) => sub.course)
  courseComments: CourseComment[];

  @OneToMany(() => CourseRating, (sub) => sub.course)
  courseRatings: CourseRating[];

  @OneToMany(() => NotificationModel, (sub) => sub.course)
  notifications: NotificationModel[];

  @OneToMany(() => CourseProgress, (sub) => sub.course)
  courseProgresses: CourseProgress[];
}

@Entity('course_progresses')
export class CourseProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'course_id', type: 'int' })
  courseId: number;

  @Column({ type: 'float', default: 0 })
  progress: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.courseProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.courseProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
