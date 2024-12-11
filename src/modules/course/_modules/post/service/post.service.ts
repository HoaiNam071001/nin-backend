import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entity/post.entity';
import { User } from '../../../../user/entity/user.entity';
import { PostDto, UpdatePostDto } from '../dto/post.dto';
import { SectionService } from '../../section/service/section.service';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PostService {
  constructor(
    private sectionService: SectionService,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async updateBySection(
    sectionId: number,
    payload: UpdatePostDto,
    user: User,
  ): Promise<PostDto> {
    try {
      const section = await this.sectionService.findOne(sectionId);
      if (!section) {
        throw new NotFoundException(`Section not found`);
      }

      const post = await this.findBySection(sectionId);

      if (post) {
        const newPost = await this.postRepository.save({
          ...post,
          ...payload,
        });
        return plainToClass(PostDto, newPost);
      }

      const newPost = this.postRepository.create({
        ...payload,
      });
      await this.postRepository.save(newPost);
      return await this.findBySection(sectionId);
    } catch (err) {
      throw new Error(`Error uploading file ${err}`);
    }
  }

  async findBySection(sectionId: number): Promise<PostDto> {
    const section = await this.postRepository.findOne({
      where: { sectionId },
    });
    return plainToClass(PostDto, section);
  }
}
