import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreatePurchaseInvoiceDocumentDto } from './dto/create-purchase-invoice-document.dto';
import { UpdatePurchaseInvoiceDocumentDto } from './dto/update-purchase-invoice-document.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { PurchaseInvoiceDocumentService } from './purchase-invoice-document.service';
import { purchaseInvoiceIdParamSchema } from '../purchase-invoice/validator/param/purchase-invoice-id.param';
import { createPurchaseInvoiceDocumentSchema } from './validator/request/create-purchase-invoice-document.request';
import { purchaseInvoiceDocumentIdParamSchema } from './validator/param/purchase-invoice-document-id.param';
import { updatePurchaseInvoiceDocumentSchema } from './validator/request/update-purchase-invoice-document.request';

@Controller()
export class PurchaseInvoiceDocumentController {
  constructor(
    private readonly purchaseInvoiceDocumentService: PurchaseInvoiceDocumentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Param(
      'invoiceId',
      new JoiValidationParamPipe(purchaseInvoiceIdParamSchema),
    )
    invoiceId: string,
    @Body(new JoiValidationPipe(createPurchaseInvoiceDocumentSchema))
    createPurchaseInvoiceDocumentDto: CreatePurchaseInvoiceDocumentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.purchaseInvoiceDocumentService.create(
      +invoiceId,
      files,
      createPurchaseInvoiceDocumentDto,
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
    @Param(
      'id',
      new JoiValidationParamPipe(purchaseInvoiceDocumentIdParamSchema),
    )
    id: string,
    @Body(new JoiValidationPipe(updatePurchaseInvoiceDocumentSchema))
    updatePurchaseInvoiceDocumentDto: UpdatePurchaseInvoiceDocumentDto,
  ) {
    return this.purchaseInvoiceDocumentService.update(
      +invoiceId,
      +id,
      updatePurchaseInvoiceDocumentDto,
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
    @Param(
      'id',
      new JoiValidationParamPipe(purchaseInvoiceDocumentIdParamSchema),
    )
    id: string,
  ) {
    return this.purchaseInvoiceDocumentService.delete(+invoiceId, +id);
  }
}
