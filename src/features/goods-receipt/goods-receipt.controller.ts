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
import { GoodsReceiptService } from './goods-receipt.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { User } from 'aws-sdk/clients/appstream';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { createGoodsReceiptSchema } from './validator/request/create-goods-receipt.request';
import { goodsReceiptIdParamSchema } from './validator/param/goods-receipt-id.param';
import { updateGoodsReceiptSchema } from './validator/request/update-goods-receipt.request';

@Controller()
export class GoodsReceiptController {
  constructor(private readonly goodsReceiptService: GoodsReceiptService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createGoodsReceiptSchema))
    createGoodsReceiptDto: CreateGoodsReceiptDto,
  ) {
    return this.goodsReceiptService.create(createGoodsReceiptDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.goodsReceiptService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(goodsReceiptIdParamSchema))
    id: string,
  ) {
    return this.goodsReceiptService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(goodsReceiptIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updateGoodsReceiptSchema))
    updateGoodsReceiptDto: UpdateGoodsReceiptDto,
  ) {
    return this.goodsReceiptService.update(+id, updateGoodsReceiptDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(goodsReceiptIdParamSchema))
    id: string,
  ) {
    return this.goodsReceiptService.delete(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/complete')
  approve(
    @Param('id', new JoiValidationParamPipe(goodsReceiptIdParamSchema))
    id: string,
    @CurrentUser() user,
  ) {
    return this.goodsReceiptService.goodsReceiptComplete(+id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  cancel(
    @Param('id', new JoiValidationParamPipe(goodsReceiptIdParamSchema))
    id: string,
  ) {
    return this.goodsReceiptService.cancelGoodsReceipt(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async pdf(
    @Param('id', new JoiValidationParamPipe(goodsReceiptIdParamSchema))
    id: string,
    @Res() res,
    @CurrentUser() user: User,
  ) {
    return this.goodsReceiptService.pdf(+id, res, user);
  }
}
