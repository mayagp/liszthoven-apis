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
import { PlanImplementService } from './plan-implement.service';
import { CreatePlanImplementDto } from './dto/create-plan-implement.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { purchasePlanIdParamSchema } from '../purchase-plan/validator/param/purchase-plan-id.param';
import { createPlanImplementSchema } from './validator/request/create-plan-implement.request';
import { planImplementIdParamSchema } from './validator/param/plan-implement-id.param';
import { updatePlanImplementSchema } from './validator/request/update-plan-implement.request';
import { UpdatePlanImplementDto } from './dto/update-plan-implement.dto';

@Controller()
export class PlanImplementController {
  constructor(private readonly planImplementService: PlanImplementService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param(
      'purchasePlanId',
      new JoiValidationParamPipe(purchasePlanIdParamSchema),
    )
    purchasePlanId: string,
    @Body(new JoiValidationPipe(createPlanImplementSchema))
    createPlanImplementDto: CreatePlanImplementDto,
  ) {
    return this.planImplementService.create(
      +purchasePlanId,
      createPlanImplementDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param(
      'purchasePlanId',
      new JoiValidationParamPipe(purchasePlanIdParamSchema),
    )
    purchasePlanId: string,
    @Param('id', new JoiValidationParamPipe(planImplementIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updatePlanImplementSchema))
    updatePlanImplementDto: UpdatePlanImplementDto,
  ) {
    return this.planImplementService.update(+id, updatePlanImplementDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param(
      'purchasePlanId',
      new JoiValidationParamPipe(purchasePlanIdParamSchema),
    )
    purchasePlanId: string,
    @Param('id', new JoiValidationParamPipe(planImplementIdParamSchema))
    id: string,
  ) {
    return this.planImplementService.delete(+id);
  }
}
