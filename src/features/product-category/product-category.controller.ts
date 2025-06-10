import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { ProductCategoryService } from './product-category.service';
import { createProductCategorySchema } from './validator/request/create-product-category.request';
import { productCategoryIdParamSchema } from './validator/param/product-category-id.param';

@Controller()
export class ProductCategoryController {
  constructor(
    private readonly productCategoryAdminService: ProductCategoryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createProductCategorySchema))
    createProductCategoryDto: CreateProductCategoryDto,
  ) {
    return this.productCategoryAdminService.create(createProductCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.productCategoryAdminService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(productCategoryIdParamSchema))
    id: string,
  ) {
    return this.productCategoryAdminService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(productCategoryIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(createProductCategorySchema))
    updateProductCategoryDto: CreateProductCategoryDto,
  ) {
    return this.productCategoryAdminService.update(
      +id,
      updateProductCategoryDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(productCategoryIdParamSchema))
    id: string,
  ) {
    return this.productCategoryAdminService.delete(+id);
  }
}
