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
  UseGuards,
} from '@nestjs/common';
import { PurchasePaymentService } from './purchase-payment.service';
import { CreatePurchasePaymentDto } from './dto/create-purchase-payment.dto';
import { UpdatePurchasePaymentDto } from './dto/update-purchase-payment.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchasePaymentIdParamSchema } from './validator/param/purchase-payment-id.param';
import { updatePurchasePaymentSchema } from './validator/request/update-purchase-payment.request';
import { createPurchasePaymentSchema } from './validator/request/create-purchase-payment.request';

@Controller()
export class PurchasePaymentController {
  constructor(
    private readonly purchasePaymentService: PurchasePaymentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createPurchasePaymentSchema))
    createPurchasePaymentDto: CreatePurchasePaymentDto,
    @CurrentUser() user,
  ) {
    return this.purchasePaymentService.create(createPurchasePaymentDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.purchasePaymentService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(purchasePaymentIdParamSchema))
    id: string,
  ) {
    return this.purchasePaymentService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(purchasePaymentIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updatePurchasePaymentSchema))
    updatePurchasePaymentDto: UpdatePurchasePaymentDto,
  ) {
    return this.purchasePaymentService.update(+id, updatePurchasePaymentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(purchasePaymentIdParamSchema))
    id: string,
  ) {
    return this.purchasePaymentService.delete(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/approved')
  statusApproved(
    @Param('id', new JoiValidationParamPipe(purchasePaymentIdParamSchema))
    id: string,
    @CurrentUser() user,
  ) {
    return this.purchasePaymentService.setStatusAsApproved(+id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancelled')
  statusCancelled(
    @Param('id', new JoiValidationParamPipe(purchasePaymentIdParamSchema))
    id: string,
  ) {
    return this.purchasePaymentService.setStatusAsCancelled(+id);
  }
}
