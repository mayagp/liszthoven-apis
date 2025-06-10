import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryHistoryService } from './inventory-history.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { inventoryHistoryIdParamSchema } from './validator/param/inventory-history-id.param';

@Controller()
export class InventoryHistoryController {
  constructor(
    private readonly inventoryHistoryService: InventoryHistoryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.inventoryHistoryService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(inventoryHistoryIdParamSchema))
    id: string,
  ) {
    return this.inventoryHistoryService.findOne(+id);
  }
}
