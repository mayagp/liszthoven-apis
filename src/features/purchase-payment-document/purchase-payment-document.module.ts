import { Module } from '@nestjs/common';
import { PurchasePaymentDocumentService } from './purchase-payment-document.service';
import { PurchasePaymentDocumentController } from './purchase-payment-document.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchasePaymentDocument } from './entities/purchase-payment-document.entity';

@Module({
  imports: [SequelizeModule.forFeature([PurchasePaymentDocument])],
  controllers: [PurchasePaymentDocumentController],
  providers: [PurchasePaymentDocumentService],
})
export class PurchasePaymentDocumentModule {}
