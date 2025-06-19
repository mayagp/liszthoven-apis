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
import { CreateGoodsReceiptDocumentDto } from './dto/create-goods-receipt-document.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { goodsReceiptIdParamSchema } from '../goods-receipt/validator/param/goods-receipt-id.param';
import { GoodsReceiptDocumentService } from './goods-receipt-document.service';
import { createGoodsReceiptDocumentSchema } from './validator/request/create-goods-receipt-document.request';
import { goodsReceiptDocumentIdParamSchema } from './validator/param/goods-receipt-document-id.param';
import { updateGoodsReceiptDocumentSchema } from './validator/request/update-goods-receipt-document.request';
import { UpdateGoodsReceiptDocumentDto } from './dto/update-goods-receipt-document.dto';

@Controller()
export class GoodsReceiptDocumentController {
  constructor(
    private readonly goodsReceiptDocumentService: GoodsReceiptDocumentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(
    @Param(
      'goodsReceiptId',
      new JoiValidationParamPipe(goodsReceiptIdParamSchema),
    )
    goodsReceiptId: string,
    @Body(new JoiValidationPipe(createGoodsReceiptDocumentSchema))
    createGoodsReceiptDocumentDto: CreateGoodsReceiptDocumentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.goodsReceiptDocumentService.create(
      +goodsReceiptId,
      files,
      createGoodsReceiptDocumentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param(
      'goodsReceiptId',
      new JoiValidationParamPipe(goodsReceiptIdParamSchema),
    )
    goodsReceiptId: string,
    @Param('id', new JoiValidationParamPipe(goodsReceiptDocumentIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updateGoodsReceiptDocumentSchema))
    updateGoodsReceiptDocumentDto: UpdateGoodsReceiptDocumentDto,
  ) {
    return this.goodsReceiptDocumentService.update(
      +goodsReceiptId,
      +id,
      updateGoodsReceiptDocumentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param(
      'goodsReceiptId',
      new JoiValidationParamPipe(goodsReceiptIdParamSchema),
    )
    goodsReceiptId: string,
    @Param('id', new JoiValidationParamPipe(goodsReceiptDocumentIdParamSchema))
    id: string,
  ) {
    return this.goodsReceiptDocumentService.delete(+goodsReceiptId, +id);
  }
}
