import { Module } from '@nestjs/common';
import { PurchaseOrderWarehouseService } from './purchase-order-warehouse.service';
import { PurchaseOrderWarehouseController } from './purchase-order-warehouse.controller';

@Module({
  controllers: [PurchaseOrderWarehouseController],
  providers: [PurchaseOrderWarehouseService]
})
export class PurchaseOrderWarehouseModule {}
