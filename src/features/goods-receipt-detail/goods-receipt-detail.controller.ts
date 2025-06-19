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
import { GoodsReceiptDetailService } from './goods-receipt-detail.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { goodsReceiptIdParamSchema } from '../goods-receipt/validator/param/goods-receipt-id.param';
import { GoodsReceiptDetailDto } from './dto/goods-receipt-detail.dto';
import { createGoodsReceiptDetailSchema } from './validator/request/create-goods-receipt-detail.request';
import { goodsReceiptDetailIdParamSchema } from './validator/param/goods-receipt-detail-id.param';

@Controller()
export class GoodsReceiptDetailController {
  constructor(
    private readonly goodsReceiptDetailService: GoodsReceiptDetailService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param(
      'goodsReceiptId',
      new JoiValidationParamPipe(goodsReceiptIdParamSchema),
    )
    goodsReceiptId: string,
    @Body(new JoiValidationPipe(createGoodsReceiptDetailSchema))
    goodsReceiptDetailDto: GoodsReceiptDetailDto,
  ) {
    return this.goodsReceiptDetailService.create(
      +goodsReceiptId,
      goodsReceiptDetailDto,
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
    @Param('id', new JoiValidationParamPipe(goodsReceiptDetailIdParamSchema))
    detailId: string,
    @Body(new JoiValidationPipe(createGoodsReceiptDetailSchema))
    goodsReceiptDetailDto: GoodsReceiptDetailDto,
  ) {
    return this.goodsReceiptDetailService.update(
      +goodsReceiptId,
      +detailId,
      goodsReceiptDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(goodsReceiptDetailIdParamSchema))
    id: string,
  ) {
    return this.goodsReceiptDetailService.delete(+id);
  }
}
