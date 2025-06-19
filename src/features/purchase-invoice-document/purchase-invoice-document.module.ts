import { Module } from '@nestjs/common';
import { PurchaseInvoiceDocumentService } from './purchase-invoice-document.service';
import { PurchaseInvoiceDocumentController } from './purchase-invoice-document.controller';
import { PurchaseInvoiceDocument } from './entities/purchase-invoice-document.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([PurchaseInvoiceDocument])],
  controllers: [PurchaseInvoiceDocumentController],
  providers: [PurchaseInvoiceDocumentService],
})
export class PurchaseInvoiceDocumentModule {}
