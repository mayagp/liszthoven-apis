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
  Res,
  UseGuards,
} from '@nestjs/common';
import { SupplierQuotationService } from './supplier-quotation.service';
import { CreateSupplierQuotationDto } from './dto/create-supplier-quotation.dto';
import { UpdateSupplierQuotationDto } from './dto/update-supplier-quotation.dto';
import { User } from 'aws-sdk/clients/appstream';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { createSupplierQuotationSchema } from './validator/request/create-supplier-quotation.request';
import { supplierQuotationIdParamSchema } from './validator/param/supplier-quotation-id.param';
import { updateSupplierQuotationSchema } from './validator/request/update-supplier-quotation.request';

@Controller()
export class SupplierQuotationController {
  constructor(
    private readonly supplierQuotationService: SupplierQuotationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createSupplierQuotationSchema))
    createSupplierQuotationDto: CreateSupplierQuotationDto,
  ) {
    return this.supplierQuotationService.create(createSupplierQuotationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.supplierQuotationService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(supplierQuotationIdParamSchema))
    id: string,
  ) {
    return this.supplierQuotationService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(supplierQuotationIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updateSupplierQuotationSchema))
    updateSupplierQuotationDto: UpdateSupplierQuotationDto,
  ) {
    return this.supplierQuotationService.update(
      +id,
      updateSupplierQuotationDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(supplierQuotationIdParamSchema))
    id: string,
  ) {
    return this.supplierQuotationService.delete(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/received')
  statusReceived(
    @Param('id', new JoiValidationParamPipe(supplierQuotationIdParamSchema))
    id: string,
  ) {
    return this.supplierQuotationService.setStatusAsReceived(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancelled')
  statusCancelled(
    @Param('id', new JoiValidationParamPipe(supplierQuotationIdParamSchema))
    id: string,
  ) {
    return this.supplierQuotationService.setStatusAsCancelled(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async pdf(
    @Param('id', new JoiValidationParamPipe(supplierQuotationIdParamSchema))
    id: string,
    @Res() res,
    @CurrentUser() user: User,
  ) {
    return this.supplierQuotationService.pdf(+id, res, user);
  }
}
