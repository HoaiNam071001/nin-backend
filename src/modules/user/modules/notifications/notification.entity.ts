import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../../course/entity/course.entity';
import { User } from '../../entity/user.entity';
import {
  NotificationMetadata,
  NotificationStatus,
  NotificationType,
} from './notification.dto';

@Entity('notifications')
export class NotificationModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  type: NotificationType;

  @Column({ type: 'varchar', length: 20, default: NotificationStatus.UNREAD })
  status: NotificationStatus;

  @Column({ type: 'json', nullable: true })
  data: NotificationMetadata;

  @Column({ name: 'sender_id', type: 'int', nullable: true })
  senderId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'course_id', nullable: true })
  courseId: number;

  @ManyToOne(() => Course, (course) => course.courseRatings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
