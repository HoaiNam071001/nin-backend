import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseComment } from './entity/comment.entity';
import { CourseCommentService } from './service/comment.service';
import { CourseCommentController } from './controller/comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseComment])],
  providers: [CourseCommentService],
  controllers: [CourseCommentController],
  exports: [CourseCommentService], // If you need to use this service in other modules.
})
export class CourseCommentModule {}
