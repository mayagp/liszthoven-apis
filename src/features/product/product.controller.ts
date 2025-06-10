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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { createProductSchema } from './validator/request/create-product.request';
import { productIdParamSchema } from './validator/param/product-id.param';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Body(new JoiValidationPipe(createProductSchema))
    createProductDto: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.productService.create(createProductDto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.productService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(productIdParamSchema))
    id: string,
  ) {
    return this.productService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(productIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(createProductSchema))
    updateProductDto: CreateProductDto,
  ) {
    return this.productService.update(+id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(productIdParamSchema))
    id: string,
  ) {
    return this.productService.delete(+id);
  }

  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('file'))
  // @Post('import-excel')
  // importExcel(@UploadedFile() file: Express.Multer.File) {
  //   return this.productService.importExcel(file);
  // }
}
