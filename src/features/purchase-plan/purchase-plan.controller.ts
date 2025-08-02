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
import { PurchasePlanService } from './purchase-plan.service';
import { CreatePurchasePlanDto } from './dto/create-purchase-plan.dto';
import { UpdatePurchasePlanDto } from './dto/update-purchase-plan.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchasePlanIdParamSchema } from './validator/param/purchase-plan-id.param';
import { createPurchasePlanSchema } from './validator/request/create-purchase-plan.request';
import { updatePurchasePlanSchema } from './validator/request/update-purchase-plan.request';

@Controller()
export class PurchasePlanController {
  constructor(private readonly purchasePlanService: PurchasePlanService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createPurchasePlanSchema))
    createPurchasePlanDto: CreatePurchasePlanDto,
  ) {
    return this.purchasePlanService.create(createPurchasePlanDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.purchasePlanService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(purchasePlanIdParamSchema))
    id: string,
  ) {
    return this.purchasePlanService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(purchasePlanIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updatePurchasePlanSchema))
    updatePurchasePlanDto: UpdatePurchasePlanDto,
  ) {
    return this.purchasePlanService.update(+id, updatePurchasePlanDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(purchasePlanIdParamSchema))
    id: string,
  ) {
    return this.purchasePlanService.delete(+id);
  }
}
