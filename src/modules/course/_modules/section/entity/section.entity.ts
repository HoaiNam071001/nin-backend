import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { SectionType } from '../../../../../common/enums/roles.enum';
import { Course } from '../../../entity/course.entity';
import { Video } from '../../video/entity/video.entity';
import { VideoDto } from '../../video/dto/video.dto';
import { Post } from '../../post/entity/post.entity';
import { PostDto } from '../../post/dto/post.dto';
import { FileDto } from '../../../../file/dto/file.dto';
import { NFile } from '../../../../file/entity/file.entity';

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

  // @Column({ name: 'parent_id', type: 'int', nullable: true })
  // parentId: number;

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
}
