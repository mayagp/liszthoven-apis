import { Module } from '@nestjs/common';
import { GoodsReceiptDetailService } from './goods-receipt-detail.service';
import { GoodsReceiptDetailController } from './goods-receipt-detail.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { GoodsReceipt } from '../goods-receipt/entities/goods-receipt.entity';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import { GoodsReceiptDetail } from './entities/goods-receipt-detail.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      GoodsReceipt,
      PurchaseInvoice,
      GoodsReceiptDetail,
    ]),
  ],
  controllers: [GoodsReceiptDetailController],
  providers: [GoodsReceiptDetailService],
})
export class GoodsReceiptDetailModule {}
