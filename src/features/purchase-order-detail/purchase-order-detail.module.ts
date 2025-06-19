import { Module } from '@nestjs/common';
import { PurchaseOrderDetailService } from './purchase-order-detail.service';
import { PurchaseOrderDetailController } from './purchase-order-detail.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { PurchaseOrderDetail } from './entities/purchase-order-detail.entity';

@Module({
  imports: [SequelizeModule.forFeature([PurchaseOrderDetail, PurchaseOrder])],
  controllers: [PurchaseOrderDetailController],
  providers: [PurchaseOrderDetailService],
})
export class PurchaseOrderDetailModule {}
