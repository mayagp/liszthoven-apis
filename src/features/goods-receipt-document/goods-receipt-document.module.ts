import { Module } from '@nestjs/common';
import { GoodsReceiptDocumentService } from './goods-receipt-document.service';
import { GoodsReceiptDocumentController } from './goods-receipt-document.controller';
import { GoodsReceiptDocument } from './entities/goods-receipt-document.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([GoodsReceiptDocument])],
  controllers: [GoodsReceiptDocumentController],
  providers: [GoodsReceiptDocumentService],
})
export class GoodsReceiptDocumentModule {}
