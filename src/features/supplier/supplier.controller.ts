import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { supplierIdParamSchema } from './validator/param/supplier-id.param';
import { createSupplierSchema } from './validator/request/create-supplier.request';
import { updateSupplierSchema } from './validator/request/update-supplier.request';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller()
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createSupplierSchema))
    createSupplierDto: CreateSupplierDto,
  ) {
    return this.supplierService.create(createSupplierDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.supplierService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(supplierIdParamSchema)) id: string,
  ) {
    return this.supplierService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(supplierIdParamSchema)) id: string,
    @Body(new JoiValidationPipe(updateSupplierSchema))
    updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(+id, updateSupplierDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(supplierIdParamSchema)) id: string,
  ) {
    return this.supplierService.delete(+id);
  }
}
