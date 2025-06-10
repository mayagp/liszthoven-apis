import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductImage } from '../product-image/entities/product-image.entity';
import { Product } from './entities/product.entity';

@Module({
  imports: [SequelizeModule.forFeature([Product, ProductImage])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
