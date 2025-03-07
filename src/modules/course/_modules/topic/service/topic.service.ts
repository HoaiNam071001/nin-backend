import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseTopic, Topic } from '../entity/topic.entity';
import { Repository } from 'typeorm';
import { TopicDto } from '../dto/topic.dto';
import { plainToClass } from 'class-transformer';
import { filter, includes, map } from 'lodash';
import {
  PagingRequestBase,
  PagingRequestDto,
} from '../../../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(CourseTopic)
    private readonly courseTopicRepository: Repository<CourseTopic>,
  ) {}

  async create(name: string): Promise<Topic> {
    const topic = this.topicRepository.create({
      name,
    });
    return await this.topicRepository.save(topic);
  }

  async createByCourse(
    courseId: number,
    topicIds: number[],
  ): Promise<CourseTopic[]> {
    const courseTopics = map(topicIds, (topicId) =>
      this.courseTopicRepository.create({
        courseId: courseId,
        topicId: topicId,
      }),
    );
    return await this.courseTopicRepository.save(courseTopics);
  }

  async findByCourse(courseId: number): Promise<TopicDto[]> {
    const courseTopics = await this.courseTopicRepository.find({
      where: { courseId },
      relations: ['topic'],
    });
    return courseTopics.map((item) => plainToClass(TopicDto, item.topic));
  }

  async updateByCourse(
    courseId: number,
    topicIds: number[],
    prevTopics: TopicDto[],
  ): Promise<TopicDto[]> {
    const topicsToAdd = filter(
      topicIds,
      (topicId) => !prevTopics.some((e) => e.id === topicId),
    );

    // remove
    const topicsToRemove = prevTopics.filter(
      (topic) => !includes(topicIds, topic.id),
    );

    if (topicsToRemove.length > 0) {
      const courseTopics = map(topicsToRemove, (e) => ({
        topicId: e.id,
        courseId: courseId,
      }));
      this.courseTopicRepository.remove(courseTopics);
    }

    // Thêm các topic mới
    let newTopics: TopicDto[] = [];
    if (topicsToAdd.length > 0) {
      const courseTopicsToAdd = topicsToAdd.map((topicId) =>
        this.courseTopicRepository.create({
          courseId: courseId,
          topicId: topicId,
        }),
      );
      newTopics = plainToClass(
        TopicDto,
        await this.courseTopicRepository.save(courseTopicsToAdd),
      );
    }

    return map(topicIds, (topicId) => {
      return (
        prevTopics.find((e) => e.id === topicId) ||
        newTopics.find((e) => e.id === topicId)
      );
    }).filter((e) => e);
  }

  async findMany(pagable: PagingRequestBase) {
    const query = new PagingRequestDto<Topic>(pagable, ['name']).mapOrmQuery();
    const [data, total] = await this.topicRepository.findAndCount(query);

    const value = new PaginationResponseDto<TopicDto>(
      data.map((e) => plainToClass(TopicDto, e)),
      total,
      pagable.page,
      pagable.size,
    );
    return value;
  }
}
