import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { PostService } from './service/post.service';
import { PostController } from './controller/post.controller';
import { SectionModule } from '../section/section.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), SectionModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {
  static TypeOrmModule: Post;
}
