import { Module } from '@nestjs/common';
import { GoodsReceiptService } from './goods-receipt.service';
import { GoodsReceiptController } from './goods-receipt.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutoNumber } from '../auto-number/entities/auto-number.entity';
import { GoodsReceiptDetail } from '../goods-receipt-detail/entities/goods-receipt-detail.entity';
import { InventoryInTransaction } from '../inventory-transaction/entities/inventory-in-transaction.entity';
import { InventoryOutTransaction } from '../inventory-transaction/entities/inventory-out-transaction.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { InventoryTransactionService } from '../inventory-transaction/inventory-transaction.service';
import { AutoNumberService } from '../auto-number/auto-number.service';
import { GrSerialNumber } from '../serialize-item/entities/gr-serial-number.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      GoodsReceipt,
      GoodsReceiptDetail,
      GrSerialNumber,
      PurchaseInvoice,
      PurchaseOrderDetail,
      InventoryInTransaction,
      InventoryOutTransaction,
      Inventory,
      Product,
      AutoNumber,
    ]),
  ],
  controllers: [GoodsReceiptController],
  providers: [
    GoodsReceiptService,
    InventoryTransactionService,
    AutoNumberService,
  ],
})
export class GoodsReceiptModule {}
