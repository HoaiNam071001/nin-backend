import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entity/category.entity';
import { IsNull, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { CategoryDto } from '../dto/category.dto';
import { CustomNotFoundException } from '../../../../../common/exceptions/http/custom-not-found.exception';
import { PagingRequestDto } from '../../../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findByById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new CustomNotFoundException('Category not found');
    }
    return category;
  }

  async findParentList(pagable: PagingRequestDto<Category>) {
    const query = new PagingRequestDto(pagable, ['name']).mapOrmQuery();
    query.where = {
      ...query.where,
      parentCategory: { id: null },
    };
    const [data, total] = await this.categoryRepository.findAndCount(query);

    return new PaginationResponseDto<CategoryDto>(
      data.map((e) => plainToClass(CategoryDto, e)),
      total,
      pagable.page,
      pagable.size,
    );
  }

  async findAll() {
    const categories = await this.categoryRepository.find({
      relations: ['subcategories'],
      where: {
        parentCategory: IsNull(),
      },
    });
    return categories.map((e) => plainToClass(CategoryDto, e));
  }

  async findChildList(parentId: number, pagable: PagingRequestDto<Category>) {
    const query = new PagingRequestDto(pagable, ['name']).mapOrmQuery();
    query.where = {
      ...query.where,
      parentCategory: { id: parentId },
    };
    const [data, total] = await this.categoryRepository.findAndCount(query);

    return new PaginationResponseDto<CategoryDto>(
      data.map((e) => plainToClass(CategoryDto, e)),
      total,
      pagable.page,
      pagable.size,
    );
  }
}
