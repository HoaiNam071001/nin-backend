import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../../user/entity/user.entity';
import { Course } from '../../../entity/course.entity';

@Entity('course_comments')
export class CourseComment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.courseComments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.courseComments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => CourseComment, (courseComment) => courseComment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment: CourseComment;

  @Column({ name: 'parent_comment_id', nullable: true })
  parentId: number;

  @Column({ name: 'comment_text', type: 'text' })
  commentText: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(
    () => CourseComment,
    (courseComment) => courseComment.parentComment,
    { onDelete: 'CASCADE' },
  )
  replies: CourseComment[];
}
