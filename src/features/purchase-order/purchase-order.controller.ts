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
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { createPurchaseOrderSchema } from './validator/request/create-purchase-order.request';
import { purchaseOrderIdParamSchema } from './validator/param/purchase-order-id.param';
import { updatePurchaseOrderSchema } from './validator/request/update-purchase-order.request';
import { User } from '../user/entities/user.entity';

@Controller()
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createPurchaseOrderSchema))
    createPurchaseOrderDto: CreatePurchaseOrderDto,
    @CurrentUser() user,
  ) {
    return this.purchaseOrderService.create(createPurchaseOrderDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.purchaseOrderService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    id: string,
  ) {
    return this.purchaseOrderService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updatePurchaseOrderSchema))
    updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrderService.update(+id, updatePurchaseOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    id: string,
  ) {
    return this.purchaseOrderService.delete(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/approve')
  approve(
    @Param('id', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    id: string,
    @CurrentUser() user,
  ) {
    return this.purchaseOrderService.approvePurchaseOrder(+id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  cancel(
    @Param('id', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    id: string,
  ) {
    return this.purchaseOrderService.cancelPurchaseOrder(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async pdf(
    @Param('id', new JoiValidationParamPipe(purchaseOrderIdParamSchema))
    id: string,
    @Res() res,
    @CurrentUser() user: User,
  ) {
    return this.purchaseOrderService.pdf(+id, res, user);
  }
}
