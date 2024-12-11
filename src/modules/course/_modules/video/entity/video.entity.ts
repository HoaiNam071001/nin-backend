import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Section } from '../../section/entity/section.entity';
import { NFile } from '../../../../file/entity/file.entity';
import { FileDto } from '../../../../file/dto/file.dto';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Section, (section) => section.video, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ name: 'section_id', type: 'int' })
  sectionId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => NFile, (file) => file.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileDto;
}
