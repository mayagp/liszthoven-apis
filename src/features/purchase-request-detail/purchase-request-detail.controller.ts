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
import { PurchaseRequestDetailService } from './purchase-request-detail.service';
import { CreatePurchaseRequestDetailDto } from './dto/create-purchase-request-detail.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchaseRequestIdParamSchema } from '../purchase-request/validator/param/purchase-request-id.param';
import { createPurchaseRequestDetailSchema } from './validator/request/create-purchase-request-detail.request';
import { purchaseRequestDetailIdParamSchema } from './validator/param/purchase-request-detail-id.param';

@Controller()
export class PurchaseRequestDetailController {
  constructor(
    private readonly purchaseRequestDetailService: PurchaseRequestDetailService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param(
      'purchaseRequestId',
      new JoiValidationParamPipe(purchaseRequestIdParamSchema),
    )
    purchaseRequestId: string,
    @Body(new JoiValidationPipe(createPurchaseRequestDetailSchema))
    createPurchaseRequestDetailDto: CreatePurchaseRequestDetailDto,
  ) {
    return this.purchaseRequestDetailService.create(
      +purchaseRequestId,
      createPurchaseRequestDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param(
      'purchaseRequestId',
      new JoiValidationParamPipe(purchaseRequestIdParamSchema),
    )
    purchaseRequestId: string,
    @Param('id', new JoiValidationParamPipe(purchaseRequestDetailIdParamSchema))
    detailId: string,
    @Body(new JoiValidationPipe(createPurchaseRequestDetailSchema))
    updatePurchaseRequestDetailDto: CreatePurchaseRequestDetailDto,
  ) {
    return this.purchaseRequestDetailService.update(
      +purchaseRequestId,
      +detailId,
      updatePurchaseRequestDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param(
      'purchaseRequestId',
      new JoiValidationParamPipe(purchaseRequestIdParamSchema),
    )
    purchaseRequestId: string,
    @Param('id', new JoiValidationParamPipe(purchaseRequestDetailIdParamSchema))
    detailId: string,
  ) {
    return this.purchaseRequestDetailService.delete(
      +purchaseRequestId,
      +detailId,
    );
  }
}
