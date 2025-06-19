import { Module } from '@nestjs/common';
import { PurchaseReturnDocumentService } from './purchase-return-document.service';
import { PurchaseReturnDocumentController } from './purchase-return-document.controller';
import { PurchaseReturnDocument } from './entities/purchase-return-document.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([PurchaseReturnDocument])],
  controllers: [PurchaseReturnDocumentController],
  providers: [PurchaseReturnDocumentService],
})
export class PurchaseReturnDocumentModule {}
