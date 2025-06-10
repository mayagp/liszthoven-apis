import { Module } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { ProductCategoryController } from './product-category.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductCategory } from './entities/product-category.entity';

@Module({
  imports: [SequelizeModule.forFeature([ProductCategory])],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
})
export class ProductCategoryModule {}
