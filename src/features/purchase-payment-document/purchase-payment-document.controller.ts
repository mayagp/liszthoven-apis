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
import { PurchasePaymentDocumentService } from './purchase-payment-document.service';
import { CreatePurchasePaymentDocumentDto } from './dto/create-purchase-payment-document.dto';
import { UpdatePurchasePaymentDocumentDto } from './dto/update-purchase-payment-document.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchasePaymentIdParamSchema } from '../purchase-payment/validator/param/purchase-payment-id.param';
import { createPurchasePaymentDocumentSchema } from './validator/request/create-purchase-payment-document.request';
import { purchasePaymentDocumentIdParamSchema } from './validator/param/purchase-payment-document-id.param';
import { updatePurchasePaymentDocumentSchema } from './validator/request/update-purchase-payment-document.request';

@Controller()
export class PurchasePaymentDocumentController {
  constructor(
    private readonly purchasePaymentDocumentService: PurchasePaymentDocumentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Param(
      'purchasePaymentId',
      new JoiValidationParamPipe(purchasePaymentIdParamSchema),
    )
    purchasePaymentId: string,
    @Body(new JoiValidationPipe(createPurchasePaymentDocumentSchema))
    createPurchasePaymentDocumentDto: CreatePurchasePaymentDocumentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.purchasePaymentDocumentService.create(
      +purchasePaymentId,
      files,
      createPurchasePaymentDocumentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param(
      'purchasePaymentId',
      new JoiValidationParamPipe(purchasePaymentIdParamSchema),
    )
    purchasePaymentId: string,
    @Param(
      'id',
      new JoiValidationParamPipe(purchasePaymentDocumentIdParamSchema),
    )
    id: string,
    @Body(new JoiValidationPipe(updatePurchasePaymentDocumentSchema))
    updatePurchasePaymentDocumentDto: UpdatePurchasePaymentDocumentDto,
  ) {
    return this.purchasePaymentDocumentService.update(
      +purchasePaymentId,
      +id,
      updatePurchasePaymentDocumentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param(
      'purchasePaymentId',
      new JoiValidationParamPipe(purchasePaymentIdParamSchema),
    )
    purchasePaymentId: string,
    @Param(
      'id',
      new JoiValidationParamPipe(purchasePaymentDocumentIdParamSchema),
    )
    id: string,
  ) {
    return this.purchasePaymentDocumentService.delete(+purchasePaymentId, +id);
  }
}
