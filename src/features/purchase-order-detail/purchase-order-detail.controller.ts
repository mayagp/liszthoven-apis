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
import { PurchaseOrderDetailService } from './purchase-order-detail.service';
import { CreatePurchaseOrderDetailDto } from './dto/create-purchase-order-detail.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchaseOrderIdParamSchema } from '../purchase-order/validator/param/purchase-order-id.param';
import { createPurchaseOrderDetailSchema } from './validator/request/create-purchase-order-detail.request';
import { updatePurchaseOrderDetailSchema } from './validator/request/update-purchase-order-detail.request';
import { purchaseOrderDetailIdParamSchema } from './validator/param/purchase-order-detail-id.param';

@Controller()
export class PurchaseOrderDetailController {
  constructor(
    private readonly purchaseOrderDetailService: PurchaseOrderDetailService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('orderId', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    orderId: string,
    @Body(new JoiValidationPipe(createPurchaseOrderDetailSchema))
    createPurchaseOrderDetailDto: CreatePurchaseOrderDetailDto,
  ) {
    return this.purchaseOrderDetailService.create(
      +orderId,
      createPurchaseOrderDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('orderId', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    orderId: string,
    @Param('id', new JoiValidationParamPipe(purchaseOrderDetailIdParamSchema))
    detailId: string,
    @Body(new JoiValidationPipe(updatePurchaseOrderDetailSchema))
    updatePurchaseOrderDetailDto: CreatePurchaseOrderDetailDto,
  ) {
    return this.purchaseOrderDetailService.update(
      +orderId,
      +detailId,
      updatePurchaseOrderDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('orderId', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    orderId: string,
    @Param('id', new JoiValidationParamPipe(purchaseOrderDetailIdParamSchema))
    detailId: string,
  ) {
    return this.purchaseOrderDetailService.delete(+orderId, +detailId);
  }
}
