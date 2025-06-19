import { Module } from '@nestjs/common';
import { PurchaseReturnService } from './purchase-return.service';
import { PurchaseReturnController } from './purchase-return.controller';
import { PurchaseReturnDetail } from '../purchase-return-detail/entities/purchase-return-detail.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutoNumber } from '../auto-number/entities/auto-number.entity';
import { InventoryInTransaction } from '../inventory-transaction/entities/inventory-in-transaction.entity';
import { InventoryOutTransaction } from '../inventory-transaction/entities/inventory-out-transaction.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { PurchaseReturn } from './entities/purchase-return.entity';
import { AutoNumberService } from '../auto-number/auto-number.service';
import { InventoryTransactionService } from '../inventory-transaction/inventory-transaction.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PurchaseReturn,
      PurchaseReturnDetail,
      InventoryInTransaction,
      InventoryOutTransaction,
      Inventory,
      Product,
      AutoNumber,
    ]),
  ],
  controllers: [PurchaseReturnController],
  providers: [
    PurchaseReturnService,
    InventoryTransactionService,
    AutoNumberService,
  ],
})
export class PurchaseReturnModule {}
