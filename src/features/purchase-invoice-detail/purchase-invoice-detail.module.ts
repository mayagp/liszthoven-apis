import { Module } from '@nestjs/common';
import { PurchaseInvoiceDetailService } from './purchase-invoice-detail.service';
import { PurchaseInvoiceDetailController } from './purchase-invoice-detail.controller';
import { PurchaseInvoiceDetail } from './entities/purchase-invoice-detail.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PurchaseInvoiceDetail,
      PurchaseInvoice,
      PurchaseOrder,
      PurchaseOrderDetail,
    ]),
  ],
  controllers: [PurchaseInvoiceDetailController],
  providers: [PurchaseInvoiceDetailService],
})
export class PurchaseInvoiceDetailModule {}
