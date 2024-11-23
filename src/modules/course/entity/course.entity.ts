import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { CourseStatus } from '../../../common/enums/roles.enum';
import { CourseTopic } from './topic.entity';
import { Category } from './category.entity';
import { Level } from './level.entity';

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

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  price?: number;

  @Column({ name: 'estimated_time', type: 'int', nullable: true })
  estimatedTime?: number;

  @Column({ type: 'varchar', enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;

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

  @OneToMany(() => CourseTopic, (courseTopic) => courseTopic.course)
  courseTopics: CourseTopic[];
}
