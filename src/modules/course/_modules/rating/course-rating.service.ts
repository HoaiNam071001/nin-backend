import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseRating } from './course-rating.entity';
import {
  CreateCourseRatingDto,
  RatingStats,
  UpdateCourseRatingDto,
} from './course-rating.dto';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination-response.dto';

@Injectable()
export class CourseRatingService {
  constructor(
    @InjectRepository(CourseRating)
    private courseRatingRepository: Repository<CourseRating>,
  ) {}

  async create(
    userId: number,
    courseId: number,
    createCourseRatingDto: CreateCourseRatingDto,
  ): Promise<CourseRating> {
    const courseRating = this.courseRatingRepository.create({
      ...createCourseRatingDto,
      userId,
      courseId,
    });
    const r = await this.courseRatingRepository.save(courseRating);

    return this.courseRatingRepository.findOne({
      where: {
        id: r.id,
      },
      relations: ['user'],
    });
  }

  async findByCourse(
    courseId: number,
    rating: number,
    pagAble: PagingRequestBase,
  ) {
    const query = new PagingRequestDto<CourseRating>(pagAble, [
      'content',
    ]).mapOrmQuery({
      where: {
        course: {
          id: courseId,
        },
        ...(rating && { rating }),
      },
      relations: ['user'],
    });
    const [data, total] = await this.courseRatingRepository.findAndCount(query);

    return new PaginationResponseDto<CourseRating>(
      data,
      total,
      pagAble.page,
      pagAble.size,
    );
  }

  async findOne(id: number): Promise<CourseRating> {
    const courseRating = await this.courseRatingRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
    if (!courseRating) {
      throw new NotFoundException(`Course rating with ID ${id} not found`);
    }
    return courseRating;
  }

  async findOneByUser(userId: number, courseId: number): Promise<CourseRating> {
    const courseRating = await this.courseRatingRepository.findOne({
      where: { userId, courseId },
      relations: ['user', 'course'],
    });
    if (!courseRating) {
      throw new NotFoundException(`Course rating not found`);
    }
    return courseRating;
  }

  async update(
    id: number,
    updateCourseRatingDto: UpdateCourseRatingDto,
  ): Promise<CourseRating> {
    const courseRating = await this.findOne(id);
    Object.assign(courseRating, updateCourseRatingDto);
    return this.courseRatingRepository.save(courseRating);
  }

  async remove(id: number): Promise<void> {
    const result = await this.courseRatingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course rating with ID ${id} not found`);
    }
  }

  async getRatingStatsByCourse(courseId: number): Promise<RatingStats> {
    const result = await this.courseRatingRepository
      .createQueryBuilder('courseRating')
      .select([
        'ROUND(AVG(courseRating.rating), 2) as avg',
        'COUNT(*) as total',
        'SUM(CASE WHEN FLOOR(courseRating.rating) = 1 THEN 1 ELSE 0 END) as count1',
        'SUM(CASE WHEN FLOOR(courseRating.rating) = 2 THEN 1 ELSE 0 END) as count2',
        'SUM(CASE WHEN FLOOR(courseRating.rating) = 3 THEN 1 ELSE 0 END) as count3',
        'SUM(CASE WHEN FLOOR(courseRating.rating) = 4 THEN 1 ELSE 0 END) as count4',
        'SUM(CASE WHEN FLOOR(courseRating.rating) = 5 THEN 1 ELSE 0 END) as count5',
      ])
      .where('courseRating.courseId = :courseId', { courseId })
      .getRawOne();

    const totalRatings = parseInt(result.total, 10) || 0;
    const averageRating = result.total > 0 ? parseFloat(result.avg) || 0 : 0;
    const ratingCounts: { [key: number]: number } = {
      1: parseInt(result.count1, 10) || 0,
      2: parseInt(result.count2, 10) || 0,
      3: parseInt(result.count3, 10) || 0,
      4: parseInt(result.count4, 10) || 0,
      5: parseInt(result.count5, 10) || 0,
    };
    const ratingPercentages: { [key: number]: number } = {
      1: totalRatings > 0 ? (ratingCounts[1] / totalRatings) * 100 : 0,
      2: totalRatings > 0 ? (ratingCounts[2] / totalRatings) * 100 : 0,
      3: totalRatings > 0 ? (ratingCounts[3] / totalRatings) * 100 : 0,
      4: totalRatings > 0 ? (ratingCounts[4] / totalRatings) * 100 : 0,
      5: totalRatings > 0 ? (ratingCounts[5] / totalRatings) * 100 : 0,
    };

    return {
      averageRating,
      ratingCounts,
      ratingPercentages,
      totalRatings,
    };
  }

  // async getReport(
  //   courseId?: number,
  //   startDate?: Date,
  //   endDate?: Date,
  // ): Promise<number[]> {
  //   const queryBuilder = this.courseRatingRepository
  //     .createQueryBuilder('courseRating')
  //     .select([
  //       'SUM(CASE WHEN FLOOR(courseRating.rating) = 1 THEN 1 ELSE 0 END) as count1',
  //       'SUM(CASE WHEN FLOOR(courseRating.rating) = 2 THEN 1 ELSE 0 END) as count2',
  //       'SUM(CASE WHEN FLOOR(courseRating.rating) = 3 THEN 1 ELSE 0 END) as count3',
  //       'SUM(CASE WHEN FLOOR(courseRating.rating) = 4 THEN 1 ELSE 0 END) as count4',
  //       'SUM(CASE WHEN FLOOR(courseRating.rating) = 5 THEN 1 ELSE 0 END) as count5',
  //     ])
  //     .leftJoin('courseRating.course', 'course');

  //   if (courseId) {
  //     queryBuilder.where('courseRating.courseId = :courseId', { courseId });
  //   }

  //   if (startDate) {
  //     queryBuilder.andWhere('courseRating.createdAt >= :startDate', {
  //       startDate,
  //     });
  //   }
  //   if (endDate) {
  //     queryBuilder.andWhere('courseRating.createdAt <= :endDate', { endDate });
  //   }

  //   const result = await queryBuilder.getRawOne();

  //   return [
  //     parseInt(result.count1, 10) || 0,
  //     parseInt(result.count2, 10) || 0,
  //     parseInt(result.count3, 10) || 0,
  //     parseInt(result.count4, 10) || 0,
  //     parseInt(result.count5, 10) || 0,
  //   ];
  // }
}
