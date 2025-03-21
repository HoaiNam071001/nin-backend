import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecentSearch } from '../entity/recent-searches.entity';
import { CreateRecentSearchDto } from '../dto/recent-search.dto';

@Injectable()
export class RecentSearchesService {
  constructor(
    @InjectRepository(RecentSearch)
    private readonly recentSearchesRepository: Repository<RecentSearch>,
  ) {}

  // Tạo hoặc cập nhật bản ghi tìm kiếm
  async create(
    userId: number,
    createRecentSearchDto: CreateRecentSearchDto,
  ): Promise<RecentSearch> {
    const { searchQuery } = createRecentSearchDto;
    const existingSearch = await this.recentSearchesRepository.findOne({
      where: { userId, searchQuery },
    });

    if (existingSearch) {
      await this.recentSearchesRepository.update(existingSearch.id, {
        updatedAt: new Date(),
      });
      return this.recentSearchesRepository.findOneOrFail({
        where: { id: existingSearch.id },
      });
    }

    const recentSearch = this.recentSearchesRepository.create({
      userId,
      searchQuery,
    });
    return this.recentSearchesRepository.save(recentSearch);
  }

  async findByUserId(userId: number): Promise<RecentSearch[]> {
    return this.recentSearchesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10, // Giới hạn 10 bản ghi
      relations: ['user'],
    });
  }

  // Cập nhật một bản ghi tìm kiếm
  async update(
    id: number,
    updateRecentSearchDto: CreateRecentSearchDto,
  ): Promise<RecentSearch> {
    await this.recentSearchesRepository.update(id, updateRecentSearchDto);
    return this.recentSearchesRepository.findOneOrFail({ where: { id } });
  }

  // Xóa một bản ghi tìm kiếm
  async remove(id: number): Promise<void> {
    await this.recentSearchesRepository.delete(id);
  }
}
