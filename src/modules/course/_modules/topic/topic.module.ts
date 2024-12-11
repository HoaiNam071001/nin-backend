import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseTopic, Topic } from './entity/topic.entity';
import { TopicService } from './service/topic.service';
import { TopicController } from './controller/topic.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, CourseTopic])],
  providers: [TopicService],
  controllers: [TopicController],
  exports: [TopicService],
})
export class TopicModule {
  static TypeOrmModule: Topic;
}
