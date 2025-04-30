import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../../entity/course.entity';
import { CourseTarget } from '../../../model/course.model';

@Entity('course_targets')
export class Target {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  content: string;

  @Column({
    name: 'type',
    type: 'varchar',
    enum: CourseTarget,
    nullable: true,
  })
  type: CourseTarget;

  @Column({ name: 'course_id', type: 'int' })
  courseId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Course, (course) => course.targets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course?: Course;
}
