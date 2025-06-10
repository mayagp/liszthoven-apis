import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { CreateProductDto } from '../product/dto/create-product.dto';
import { productIdParamSchema } from '../product/validator/param/product-id.param';
import { ProductImageService } from './product-image.service';
import { createProductImageSchema } from './validator/request/create-product-image.request';
import { updateProductImageSchema } from './validator/request/update-product-image.request';
import { productImageIdParamSchema } from './validator/param/product-image-id.param';

@Controller()
export class ProductImageController {
  constructor(private readonly productImageService: ProductImageService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Param('id', new JoiValidationParamPipe(productIdParamSchema))
    productId: string,
    @Body(new JoiValidationPipe(createProductImageSchema))
    createProductDto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.productImageService.create(+productId, createProductDto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  update(
    @Param('id', new JoiValidationParamPipe(productIdParamSchema))
    productId: string,
    @Body(new JoiValidationPipe(updateProductImageSchema))
    updateProductImageDto: UpdateProductImageDto,
  ) {
    return this.productImageService.update(+productId, updateProductImageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':imageId')
  delete(
    @Param('id', new JoiValidationParamPipe(productIdParamSchema))
    productId: string,
    @Param('imageId', new JoiValidationParamPipe(productImageIdParamSchema))
    imageId: string,
  ) {
    return this.productImageService.delete(+productId, +imageId);
  }
}
