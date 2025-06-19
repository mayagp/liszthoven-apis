import { Module } from '@nestjs/common';
import { PurchaseInvoiceService } from './purchase-invoice.service';
import { PurchaseInvoiceController } from './purchase-invoice.controller';
import { PurchaseInvoiceDetail } from '../purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { PurchaseInvoice } from './entities/purchase-invoice.entity';
import { AutoNumber } from '../auto-number/entities/auto-number.entity';
import { AutoNumberService } from '../auto-number/auto-number.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PurchaseInvoice,
      PurchaseInvoiceDetail,
      PurchaseOrder,
      PurchaseOrderDetail,
      AutoNumber,
    ]),
  ],
  controllers: [PurchaseInvoiceController],
  providers: [PurchaseInvoiceService, AutoNumberService],
})
export class PurchaseInvoiceModule {}
