import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { inventoryInTransactionIdParamSchema } from './validator/param/inventory-in-id.param';

@Controller()
export class InventoryTransactionController {
  constructor(
    private readonly inventoryTransactionService: InventoryTransactionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.inventoryTransactionService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param(
      'id',
      new JoiValidationParamPipe(inventoryInTransactionIdParamSchema),
    )
    id: string,
  ) {
    return this.inventoryTransactionService.findOne(+id);
  }
}
