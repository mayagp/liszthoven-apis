import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SupplierQuotationDetailService } from './supplier-quotation-detail.service';
import { CreateSupplierQuotationDetailDto } from './dto/create-supplier-quotation-detail.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { supplierQuotationIdParamSchema } from '../supplier-quotation/validator/param/supplier-quotation-id.param';
import { createSupplierQuotationDetailSchema } from './validator/request/create-supplier-quotation-detail.request';
import { supplierQuotationDetailIdParamSchema } from './validator/param/supplier-quotation-detail-id.param';

@Controller()
export class SupplierQuotationDetailController {
  constructor(
    private readonly supplierQuotationDetailService: SupplierQuotationDetailService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param(
      'supplierQuotationId',
      new JoiValidationParamPipe(supplierQuotationIdParamSchema),
    )
    supplierQuotationId: string,
    @Body(new JoiValidationPipe(createSupplierQuotationDetailSchema))
    createSupplierQuotationDetailDto: CreateSupplierQuotationDetailDto,
  ) {
    return this.supplierQuotationDetailService.create(
      +supplierQuotationId,
      createSupplierQuotationDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param(
      'supplierQuotationId',
      new JoiValidationParamPipe(supplierQuotationIdParamSchema),
    )
    supplierQuotationId: string,
    @Param(
      'id',
      new JoiValidationParamPipe(supplierQuotationDetailIdParamSchema),
    )
    detailId: string,
    @Body(new JoiValidationPipe(createSupplierQuotationDetailSchema))
    updateSupplierQuotationDetailDto: CreateSupplierQuotationDetailDto,
  ) {
    return this.supplierQuotationDetailService.update(
      +supplierQuotationId,
      +detailId,
      updateSupplierQuotationDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param(
      'supplierQuotationId',
      new JoiValidationParamPipe(supplierQuotationIdParamSchema),
    )
    supplierQuotationId: string,
    @Param(
      'id',
      new JoiValidationParamPipe(supplierQuotationDetailIdParamSchema),
    )
    detailId: string,
  ) {
    return this.supplierQuotationDetailService.delete(
      +supplierQuotationId,
      +detailId,
    );
  }
}
