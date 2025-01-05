import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Course } from '../../../entity/course.entity';

@Entity('categories') // Tên bảng trong cơ sở dữ liệu
export class Category {
  @PrimaryGeneratedColumn() // Tạo ID tự động
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false }) // Tên vai trò
  name: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_category_id' })
  parentCategory?: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  subcategories?: Category[];

  @OneToMany(() => Course, (course) => course.category)
  courses?: Course[];
}
