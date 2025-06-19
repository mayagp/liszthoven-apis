import { Module } from '@nestjs/common';
import { PurchasePaymentAllocationService } from './purchase-payment-allocation.service';
import { PurchasePaymentAllocationController } from './purchase-payment-allocation.controller';
import { PurchasePaymentAllocation } from './entities/purchase-payment-allocation.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import { PurchasePayment } from '../purchase-payment/entities/purchase-payment.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PurchaseInvoice,
      PurchasePayment,
      PurchasePaymentAllocation,
    ]),
  ],
  controllers: [PurchasePaymentAllocationController],
  providers: [PurchasePaymentAllocationService],
})
export class PurchasePaymentAllocationModule {}
