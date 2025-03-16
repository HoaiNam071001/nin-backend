import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoryService } from '../service/category.service';
import { PagingRequestDto } from '../../../../../common/dto/pagination-request.dto';
import { CategoryDto } from '../dto/category.dto';
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  async findParentList(@Query() paging: PagingRequestDto<CategoryDto>) {
    return this.categoryService.findParentList(paging);
  }

  @Get('parent')
  async findAll() {
    return this.categoryService.findParentAll();
  }

  @Get('all')
  async find() {
    return this.categoryService.find();
  }

  @Get(':id')
  async findChildList(
    @Param('id') id: number,
    @Query() paging: PagingRequestDto<CategoryDto>,
  ) {
    return this.categoryService.findChildList(id, paging);
  }
}
