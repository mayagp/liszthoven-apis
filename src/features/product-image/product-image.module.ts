import { Module } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import { ProductImageController } from './product-image.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from '../product/entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

@Module({
  imports: [SequelizeModule.forFeature([ProductImage, Product])],
  controllers: [ProductImageController],
  providers: [ProductImageService],
})
export class ProductImageModule {}
