import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreatePurchasePaymentAllocationDto } from './dto/create-purchase-payment-allocation.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { PurchasePaymentAllocationService } from './purchase-payment-allocation.service';
import { purchasePaymentIdParamSchema } from '../purchase-payment/validator/param/purchase-payment-id.param';
import { purchasePaymentAllocationIdParamSchema } from './validator/param/purchase-payment-allocation-id.param';
import { createPurchasePaymentAllocationSchema } from './validator/request/create-purchase-payment-allocation.request';

@Controller()
export class PurchasePaymentAllocationController {
  constructor(
    private readonly purchasePaymentAllocationService: PurchasePaymentAllocationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param(
      'purchasePaymentId',
      new JoiValidationParamPipe(purchasePaymentIdParamSchema),
    )
    purchasePaymentId: string,
    @Body(new JoiValidationPipe(createPurchasePaymentAllocationSchema))
    createPurchasePaymentAllocationDto: CreatePurchasePaymentAllocationDto,
  ) {
    return this.purchasePaymentAllocationService.create(
      +purchasePaymentId,
      createPurchasePaymentAllocationDto,
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
      new JoiValidationParamPipe(purchasePaymentAllocationIdParamSchema),
    )
    id: string,
    @Body(new JoiValidationPipe(createPurchasePaymentAllocationSchema))
    updatePurchasePaymentAllocationDto: CreatePurchasePaymentAllocationDto,
  ) {
    return this.purchasePaymentAllocationService.update(
      +purchasePaymentId,
      +id,
      updatePurchasePaymentAllocationDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param(
      'id',
      new JoiValidationParamPipe(purchasePaymentAllocationIdParamSchema),
    )
    id: string,
  ) {
    return this.purchasePaymentAllocationService.delete(+id);
  }
}
