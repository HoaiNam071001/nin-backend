import { CourseDto } from '../../dto/course.dto';

export class CartItemDto {
  id: number;
  course: CourseDto;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
