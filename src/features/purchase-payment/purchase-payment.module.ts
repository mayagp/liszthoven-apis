import { Module } from '@nestjs/common';
import { PurchasePaymentService } from './purchase-payment.service';
import { PurchasePaymentController } from './purchase-payment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import { PurchasePaymentAllocation } from '../purchase-payment-allocation/entities/purchase-payment-allocation.entity';
import { PurchasePayment } from './entities/purchase-payment.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PurchaseInvoice,
      PurchasePayment,
      PurchasePaymentAllocation,
    ]),
  ],
  controllers: [PurchasePaymentController],
  providers: [PurchasePaymentService],
})
export class PurchasePaymentModule {}
