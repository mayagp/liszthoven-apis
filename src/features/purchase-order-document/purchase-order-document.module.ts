import { Module } from '@nestjs/common';
import { PurchaseOrderDocumentService } from './purchase-order-document.service';
import { PurchaseOrderDocumentController } from './purchase-order-document.controller';
import { PurchaseOrderDocument } from './entities/purchase-order-document.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([PurchaseOrderDocument])],
  controllers: [PurchaseOrderDocumentController],
  providers: [PurchaseOrderDocumentService],
})
export class PurchaseOrderDocumentModule {}
