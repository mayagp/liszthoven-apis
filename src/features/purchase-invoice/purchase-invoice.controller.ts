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
  Res,
} from '@nestjs/common';
import { PurchaseInvoiceService } from './purchase-invoice.service';
import { CreatePurchaseInvoiceDto } from './dto/create-purchase-invoice.dto';
import { UpdatePurchaseInvoiceDto } from './dto/update-purchase-invoice.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { createPurchaseInvoiceSchema } from './validator/request/create-purchase-invoice.request';
import { purchaseInvoiceIdParamSchema } from './validator/param/purchase-invoice-id.param';
import { updatePurchaseInvoiceSchema } from './validator/request/update-purchase-invoice.request';
import { User } from '../user/entities/user.entity';

@Controller()
export class PurchaseInvoiceController {
  constructor(
    private readonly purchaseInvoiceService: PurchaseInvoiceService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createPurchaseInvoiceSchema))
    createPurchaseInvoiceDto: CreatePurchaseInvoiceDto,
    @CurrentUser() user,
  ) {
    return this.purchaseInvoiceService.create(createPurchaseInvoiceDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.purchaseInvoiceService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(purchaseInvoiceIdParamSchema))
    id: string,
  ) {
    return this.purchaseInvoiceService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(purchaseInvoiceIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updatePurchaseInvoiceSchema))
    updatePurchaseInvoiceDto: UpdatePurchaseInvoiceDto,
  ) {
    return this.purchaseInvoiceService.update(+id, updatePurchaseInvoiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(purchaseInvoiceIdParamSchema))
    id: string,
  ) {
    return this.purchaseInvoiceService.delete(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/approval-request')
  approval(
    @Param('id', new JoiValidationParamPipe(purchaseInvoiceIdParamSchema))
    id: string,
    @CurrentUser() user,
  ) {
    return this.purchaseInvoiceService.purchaseInvoiceApproval(+id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/approve')
  approve(
    @Param('id', new JoiValidationParamPipe(purchaseInvoiceIdParamSchema))
    id: string,
    @CurrentUser() user,
  ) {
    return this.purchaseInvoiceService.approvePurchaseInvoice(+id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  cancel(
    @Param('id', new JoiValidationParamPipe(purchaseInvoiceIdParamSchema))
    id: string,
  ) {
    return this.purchaseInvoiceService.cancelPurchaseInvoice(+id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async pdf(
    @Param('id', new JoiValidationParamPipe(purchaseInvoiceIdParamSchema))
    id: string,
    @Res() res,
    @CurrentUser() user: User,
  ) {
    return this.purchaseInvoiceService.pdf(+id, res, user);
  }
}
