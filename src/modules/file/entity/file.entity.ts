import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Course } from '../../course/entity/course.entity';
import { SystemFileType } from '../../data/models';
import { Video } from '../../course/_modules/video/entity/video.entity';
import { Section } from '../../course/_modules/section/entity/section.entity';

@Entity('files')
export class NFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ name: 'course_id', nullable: true })
  courseId: number;

  @Column({ name: 'section_id', nullable: true })
  sectionId: number;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, (course) => course.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Section, (section) => section.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string;

  @Column({ name: 'system_type', type: 'varchar', length: 50, nullable: true })
  systemType: SystemFileType;

  @Column({ type: 'bigint', nullable: true })
  size: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Video, (video) => video.file)
  videos: Video[];
}
