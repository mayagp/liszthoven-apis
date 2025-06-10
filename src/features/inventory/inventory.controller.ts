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
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/validators/pipes/joi-validation-param.pipe';
import { inventoryIdParamSchema } from './validator/param/inventory-id.param';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryAdminService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.inventoryAdminService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new JoiValidationParamPipe(inventoryIdParamSchema))
    id: string,
  ) {
    return this.inventoryAdminService.findOne(+id);
  }
}
