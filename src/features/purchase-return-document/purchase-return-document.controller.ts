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
import { PurchaseReturnDocumentService } from './purchase-return-document.service';
import { CreatePurchaseReturnDocumentDto } from './dto/create-purchase-return-document.dto';
import { UpdatePurchaseReturnDocumentDto } from './dto/update-purchase-return-document.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchaseReturnIdParamSchema } from '../purchase-return/validator/param/purchase-return-id.param';
import { createPurchaseReturnDocumentSchema } from './validator/request/create-purchase-return-document.request';
import { purchaseReturnDocumentIdParamSchema } from './validator/param/purchase-return-document-id.param';
import { updatePurchaseReturnDocumentSchema } from './validator/request/update-purchase-return-document.request';

@Controller()
export class PurchaseReturnDocumentController {
  constructor(
    private readonly purchaseReturnDocumentService: PurchaseReturnDocumentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Param(
      'purchaseReturnId',
      new JoiValidationParamPipe(purchaseReturnIdParamSchema),
    )
    purchaseReturnId: string,
    @Body(new JoiValidationPipe(createPurchaseReturnDocumentSchema))
    createPurchaseReturnDocumentDto: CreatePurchaseReturnDocumentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.purchaseReturnDocumentService.create(
      +purchaseReturnId,
      files,
      createPurchaseReturnDocumentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param(
      'purchaseReturnId',
      new JoiValidationParamPipe(purchaseReturnIdParamSchema),
    )
    purchaseReturnId: string,
    @Param(
      'id',
      new JoiValidationParamPipe(purchaseReturnDocumentIdParamSchema),
    )
    id: string,
    @Body(new JoiValidationPipe(updatePurchaseReturnDocumentSchema))
    updatePurchaseReturnDocumentDto: UpdatePurchaseReturnDocumentDto,
  ) {
    return this.purchaseReturnDocumentService.update(
      +purchaseReturnId,
      +id,
      updatePurchaseReturnDocumentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param(
      'purchaseReturnId',
      new JoiValidationParamPipe(purchaseReturnIdParamSchema),
    )
    purchaseReturnId: string,
    @Param(
      'id',
      new JoiValidationParamPipe(purchaseReturnDocumentIdParamSchema),
    )
    id: string,
  ) {
    return this.purchaseReturnDocumentService.delete(+purchaseReturnId, +id);
  }
}
