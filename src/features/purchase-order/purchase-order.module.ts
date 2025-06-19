import { Module } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutoNumberService } from '../auto-number/auto-number.service';
import { AutoNumber } from '../auto-number/entities/auto-number.entity';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import { SupplierQuotation } from '../supplier-quotation/entities/supplier-quotation.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PurchaseOrderDetail,
      PurchaseOrder,
      SupplierQuotation,
      AutoNumber,
    ]),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService, AutoNumberService],
})
export class PurchaseOrderModule {}
