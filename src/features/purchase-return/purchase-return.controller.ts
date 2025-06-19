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
import { PurchaseReturnService } from './purchase-return.service';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { UpdatePurchaseReturnDto } from './dto/update-purchase-return.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchaseReturnIdParamSchema } from './validator/param/purchase-return-id.param';
import { createPurchaseReturnSchema } from './validator/request/create-purchase-return.request';
import { updatePurchaseReturnSchema } from './validator/request/update-purchase-return.request';

@Controller()
export class PurchaseReturnController {
  constructor(private readonly purchaseReturnService: PurchaseReturnService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createPurchaseReturnSchema))
    createPurchaseReturnDto: CreatePurchaseReturnDto,
  ) {
    return this.purchaseReturnService.create(createPurchaseReturnDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.purchaseReturnService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(purchaseReturnIdParamSchema))
    id: string,
  ) {
    return this.purchaseReturnService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(purchaseReturnIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updatePurchaseReturnSchema))
    updatePurchaseReturnDto: UpdatePurchaseReturnDto,
  ) {
    return this.purchaseReturnService.update(+id, updatePurchaseReturnDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(purchaseReturnIdParamSchema))
    id: string,
  ) {
    return this.purchaseReturnService.delete(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancelled')
  cancelled(
    @Param('id', new JoiValidationParamPipe(purchaseReturnIdParamSchema))
    id: string,
  ) {
    return this.purchaseReturnService.cancel(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/complete')
  complete(
    @Param('id', new JoiValidationParamPipe(purchaseReturnIdParamSchema))
    id: string,
  ) {
    return this.purchaseReturnService.complete(+id);
  }
}
