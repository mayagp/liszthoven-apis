import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PurchaseReturnDetailService } from './purchase-return-detail.service';
import { CreatePurchaseReturnDetailDto } from './dto/create-purchase-return-detail.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchaseReturnIdParamSchema } from '../purchase-return/validator/param/purchase-return-id.param';
import { createPurchaseReturnDetailSchema } from './validator/request/create-purchase-return-detail.request';
import { purchaseReturnDetailIdParamSchema } from './validator/param/purchase-return-detail-id.param';

@Controller()
export class PurchaseReturnDetailController {
  constructor(
    private readonly purchaseReturnDetailService: PurchaseReturnDetailService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createPurchaseReturnDetailSchema))
    createPurchaseReturnDetailDto: CreatePurchaseReturnDetailDto,
    @Param(
      'purchaseReturnId',
      new JoiValidationParamPipe(purchaseReturnIdParamSchema),
    )
    purchaseReturnId: string,
  ) {
    return this.purchaseReturnDetailService.create(
      +purchaseReturnId,
      createPurchaseReturnDetailDto,
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
    @Param('id', new JoiValidationParamPipe(purchaseReturnDetailIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(createPurchaseReturnDetailSchema))
    updatePurchaseReturnDetailDto: CreatePurchaseReturnDetailDto,
  ) {
    return this.purchaseReturnDetailService.update(
      +purchaseReturnId,
      +id,
      updatePurchaseReturnDetailDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(purchaseReturnDetailIdParamSchema))
    id: string,
  ) {
    return this.purchaseReturnDetailService.delete(+id);
  }
}
