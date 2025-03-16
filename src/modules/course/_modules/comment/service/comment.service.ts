import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CourseComment } from '../entity/comment.entity';
import {
  CommentResponseDto,
  CreateCommentDto,
  GetCommentDto,
} from '../dto/comment.dto';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination-response.dto';
import { plainToClass } from 'class-transformer';
import { ShortUser } from '../../../../user/dto/user.dto';

@Injectable()
export class CourseCommentService {
  constructor(
    @InjectRepository(CourseComment)
    private courseCommentRepository: Repository<CourseComment>,
  ) {}

  async create(
    userId: number,
    courseId: number,
    payload: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const courseComment = this.courseCommentRepository.create({
      user: { id: userId },
      course: { id: courseId },
      commentText: payload.commentText,
      parentComment: {
        id: payload.parentId,
      },
    });
    const saved = await this.courseCommentRepository.save(courseComment);
    const newComment = await this.courseCommentRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    return {
      ...newComment,
      user: plainToClass(ShortUser, newComment.user),
    };
  }

  async findByPaging(
    id: number,
    payload: GetCommentDto,
    pagAble: PagingRequestBase,
  ): Promise<PaginationResponseDto<CommentResponseDto>> {
    const query = new PagingRequestDto<CourseComment>(pagAble, [
      'name',
    ]).mapOrmQuery({
      where: {
        parentId: payload.parentId || IsNull(),
        course: { id },
      },
      relations: ['user'],
    });
    const [data, total] =
      await this.courseCommentRepository.findAndCount(query);
    let comments = data;
    if (!payload.parentId) {
      comments = await Promise.all(
        comments.map(async (comment) => {
          return await this.mapCommentToResponse(comment, payload.parentId);
        }),
      );
    }

    return new PaginationResponseDto<CommentResponseDto>(
      comments.map((e) => ({
        ...e,
        user: plainToClass(ShortUser, e.user),
      })),
      total,
      pagAble.page,
      pagAble.size,
    );
  }

  private async mapCommentToResponse(
    comment: CourseComment,
    parentId: number | null,
  ) {
    let replyCount = 0;
    if (!parentId) {
      replyCount = await this.courseCommentRepository.count({
        where: { parentComment: { id: comment.id } },
      });
    }

    return {
      ...comment,
      replyCount: replyCount,
    };
  }

  async findAll(): Promise<CourseComment[]> {
    return this.courseCommentRepository.find();
  }

  async remove(id: number): Promise<void> {
    await this.courseCommentRepository.delete(id);
  }
}
