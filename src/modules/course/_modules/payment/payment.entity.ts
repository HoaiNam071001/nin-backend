import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../../user/entity/user.entity';
import { Course } from '../../entity/course.entity';
import { CourseSubType, PaymentMethod, PaymentStatus } from './payment.dto';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId?: number;

  @ManyToOne(() => User, (sub) => sub.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount?: number;

  @Column({ type: 'timestamp', nullable: true, name: 'payment_date' })
  paymentDate: Date;

  @Column({ enum: PaymentStatus })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'transaction_id' })
  transactionUId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: true })
  currency: string;

  @OneToMany(() => PaymentDetail, (sub) => sub.transaction, {
    onDelete: 'CASCADE',
  })
  paymentDetails: PaymentDetail[];
}

@Entity('payment_details')
export class PaymentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @ManyToOne(() => PaymentTransaction, (trans) => trans.paymentDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: PaymentTransaction;

  @Column({ name: 'course_id' })
  courseId: number;

  @ManyToOne(() => Course, (course) => course.paymentDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 3, default: 'USD', nullable: true })
  currency: string;

  @OneToOne(() => CourseSubscription, (sub) => sub.payment, {
    onDelete: 'CASCADE',
  })
  courseSubscriptions: CourseSubscription[];
}

@Entity('course_subscription')
export class CourseSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.courseSubscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'course_id' })
  courseId: number;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ type: 'timestamp', nullable: true, name: 'expiration_date' })
  expirationDate: Date;

  @Column({ type: 'varchar', length: 50, default: CourseSubType.ACTIVE })
  status: CourseSubType;

  @Column({ name: 'payment_id', nullable: true })
  transactionId: number;

  @OneToOne(() => PaymentDetail, (trans) => trans.courseSubscriptions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentDetail;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
