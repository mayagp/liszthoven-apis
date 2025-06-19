import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PurchaseOrderWarehouseService } from './purchase-order-warehouse.service';
import { CreatePurchaseOrderWarehouseDto } from './dto/create-purchase-order-warehouse.dto';

@Controller()
export class PurchaseOrderWarehouseController {
  constructor(
    private readonly purchaseOrderWarehouseService: PurchaseOrderWarehouseService,
  ) {}

  @Post()
  create(
    @Body() createPurchaseOrderWarehouseDto: CreatePurchaseOrderWarehouseDto,
  ) {
    return this.purchaseOrderWarehouseService.create(
      createPurchaseOrderWarehouseDto,
    );
  }

  @Get()
  findAll() {
    return this.purchaseOrderWarehouseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrderWarehouseService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseOrderWarehouseService.remove(+id);
  }
}
