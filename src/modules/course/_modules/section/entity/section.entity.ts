import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FileDto } from '../../../../file/dto/file.dto';
import { NFile } from '../../../../file/entity/file.entity';
import { User } from '../../../../user/entity/user.entity';
import { Course } from '../../../entity/course.entity';
import { PostDto } from '../../post/dto/post.dto';
import { Post } from '../../post/entity/post.entity';
import { VideoDto } from '../../video/dto/video.dto';
import { Video } from '../../video/entity/video.entity';
import { SectionType } from '../model/section.model';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'course_id', type: 'int' })
  courseId: number;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number;

  @Column({ name: 'estimated_time', type: 'int', nullable: true })
  estimatedTime: number;

  @Column({
    name: 'section_type',
    type: 'varchar',
    enum: SectionType,
    nullable: true,
  })
  type: SectionType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Section, (section) => section.childrens, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Section;

  @OneToMany(() => Section, (section) => section.parent)
  childrens: Section[];

  @ManyToOne(() => Course, (course) => course.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToOne(() => Video, (video) => video.section)
  video: VideoDto;

  @OneToOne(() => Post, (video) => video.section)
  post: PostDto;

  @OneToMany(() => NFile, (video) => video.section)
  files: FileDto;

  @OneToMany(() => SectionProgress, (sub) => sub.section)
  sectionProgresses: SectionProgress[];
}

@Entity('section_progresses')
export class SectionProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId?: number;

  @ManyToOne(() => User, (user) => user.sectionProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'section_id', type: 'int', nullable: true })
  sectionId?: number;

  @ManyToOne(() => Section, (section) => section.sectionProgresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column({
    type: 'boolean',
    default: false,
  })
  completed: boolean;

  @Column({ type: 'integer', default: 0 })
  progress: number; // Tiến độ (phần trăm)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
