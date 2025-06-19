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
import { PurchaseOrderDocumentService } from './purchase-order-document.service';
import { CreatePurchaseOrderDocumentDto } from './dto/create-purchase-order-document.dto';
import { UpdatePurchaseOrderDocumentDto } from './dto/update-purchase-order-document.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchaseOrderIdParamSchema } from '../purchase-order/validator/param/purchase-order-id.param';
import { createPurchaseOrderDocumentSchema } from './validator/request/create-purchase-order-document.request';
import { updatePurchaseOrderDocumentSchema } from './validator/request/update-purchase-order-document.request';
import { purchaseOrderDocumentIdParamSchema } from './validator/param/purchase-order-document-id.param';

@Controller()
export class PurchaseOrderDocumentController {
  constructor(
    private readonly purchaseOrderDocumentService: PurchaseOrderDocumentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Param('orderId', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    orderId: string,
    @Body(new JoiValidationPipe(createPurchaseOrderDocumentSchema))
    createPurchaseOrderDocumentDto: CreatePurchaseOrderDocumentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.purchaseOrderDocumentService.create(
      +orderId,
      files,
      createPurchaseOrderDocumentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('orderId', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    orderId: string,
    @Param('id', new JoiValidationParamPipe(purchaseOrderDocumentIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updatePurchaseOrderDocumentSchema))
    updatePurchaseOrderDocumentDto: UpdatePurchaseOrderDocumentDto,
  ) {
    return this.purchaseOrderDocumentService.update(
      +orderId,
      +id,
      updatePurchaseOrderDocumentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('orderId', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    orderId: string,
    @Param('id', new JoiValidationParamPipe(purchaseOrderDocumentIdParamSchema))
    id: string,
  ) {
    return this.purchaseOrderDocumentService.delete(+orderId, +id);
  }
}
