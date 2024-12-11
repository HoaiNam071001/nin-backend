import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './service/category.service';
import { CategoryController } from './controller/category.controller';
import { UserModule } from '../../../user/user.module';
import { Category } from './entity/category.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Category]), UserModule],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService], // Export the service so it can be used in other modules
})
export class CategoryModule {
  static TypeOrmModule: Category;
}
