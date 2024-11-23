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
import { Course } from './course.entity';

@Entity('categories') // Tên bảng trong cơ sở dữ liệu
export class Category {
  @PrimaryGeneratedColumn() // Tạo ID tự động
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false }) // Tên vai trò
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  //   @Column({
  //     name: 'created_at',
  //     type: 'timestamp',
  //     default: () => 'CURRENT_TIMESTAMP',
  //   })
  //   createdAt: Date;

  //   @Column({
  //     name: 'updated_at',
  //     type: 'timestamp',
  //     default: () => 'CURRENT_TIMESTAMP',
  //     onUpdate: 'CURRENT_TIMESTAMP',
  //   })
  //   updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_category_id' })
  parentCategory: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  subcategories: Category[];

  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];
}
