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
import { PurchaseRequestService } from './purchase-request.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { createPurchaseRequestSchema } from './validator/request/create-purchase-request.request';
import { purchaseRequestIdParamSchema } from './validator/param/purchase-request-id.param';
import { updatePurchaseRequestSchema } from './validator/request/update-purchase-request.request';

@Controller()
export class PurchaseRequestController {
  constructor(
    private readonly purchaseRequestService: PurchaseRequestService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createPurchaseRequestSchema))
    createPurchaseRequestDto: CreatePurchaseRequestDto,
    @CurrentUser() user,
  ) {
    return this.purchaseRequestService.create(createPurchaseRequestDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.purchaseRequestService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(purchaseRequestIdParamSchema))
    id: string,
  ) {
    return this.purchaseRequestService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', new JoiValidationParamPipe(purchaseRequestIdParamSchema))
    id: string,
    @Body(new JoiValidationPipe(updatePurchaseRequestSchema))
    updatePurchaseRequestDto: UpdatePurchaseRequestDto,
  ) {
    return this.purchaseRequestService.update(+id, updatePurchaseRequestDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', new JoiValidationParamPipe(purchaseRequestIdParamSchema))
    id: string,
  ) {
    return this.purchaseRequestService.delete(+id);
  }

  // @UseGuards(JwtAuthGuard)
  // @Put(':id/approval-request')
  // statusApprovalRequest(
  //   @Param('id', new JoiValidationParamPipe(purchaseRequestIdParamSchema))
  //   id: string,
  // ) {
  //   return this.purchaseRequestService.setStatusAsApprovalRequest(+id);
  // }

  @UseGuards(JwtAuthGuard)
  @Put(':id/approved')
  statusApproved(
    @Param('id', new JoiValidationParamPipe(purchaseRequestIdParamSchema))
    id: string,
    @CurrentUser() user,
  ) {
    return this.purchaseRequestService.setStatusAsApproved(+id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/rejected')
  statusRejected(
    @Param('id', new JoiValidationParamPipe(purchaseRequestIdParamSchema))
    id: string,
  ) {
    return this.purchaseRequestService.setStatusAsRejected(+id);
  }
}
