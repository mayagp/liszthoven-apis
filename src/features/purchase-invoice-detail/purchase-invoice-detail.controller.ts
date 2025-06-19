import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PurchaseInvoiceDetailService } from './purchase-invoice-detail.service';
import { CreatePurchaseInvoiceDetailDto } from './dto/create-purchase-invoice-detail.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchaseInvoiceIdParamSchema } from '../purchase-invoice/validator/param/purchase-invoice-id.param';
import { createPurchaseInvoiceDetailSchema } from './validator/request/create-purchase-invoice-detail.request';
import { purchaseInvoiceDetailIdParamSchema } from './validator/param/purchase-invoice-detail-id.param';

@Controller()
export class PurchaseInvoiceDetailController {
  constructor(
    private readonly purchaseInvoiceDetailService: PurchaseInvoiceDetailService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param(
      'invoiceId',
      new JoiValidationParamPipe(purchaseInvoiceIdParamSchema),
    )
    invoiceId: string,
    @Body(new JoiValidationPipe(createPurchaseInvoiceDetailSchema))
    createPurchaseInvoiceDetailDto: CreatePurchaseInvoiceDetailDto,
  ) {
    return this.purchaseInvoiceDetailService.create(
      +invoiceId,
      createPurchaseInvoiceDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param(
      'invoiceId',
      new JoiValidationParamPipe(purchaseInvoiceIdParamSchema),
    )
    invoiceId: string,
    @Param('id', new JoiValidationParamPipe(purchaseInvoiceDetailIdParamSchema))
    detailId: string,
    @Body(new JoiValidationPipe(createPurchaseInvoiceDetailSchema))
    updatePurchaseInvoiceDetailDto: CreatePurchaseInvoiceDetailDto,
  ) {
    return this.purchaseInvoiceDetailService.update(
      +invoiceId,
      +detailId,
      updatePurchaseInvoiceDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param(
      'invoiceId',
      new JoiValidationParamPipe(purchaseInvoiceIdParamSchema),
    )
    invoiceId: string,
    @Param('id', new JoiValidationParamPipe(purchaseInvoiceDetailIdParamSchema))
    detailId: string,
  ) {
    return this.purchaseInvoiceDetailService.delete(+invoiceId, +detailId);
  }
}
