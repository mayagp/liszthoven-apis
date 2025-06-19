import { Module } from '@nestjs/common';
import { PurchaseReturnDetailService } from './purchase-return-detail.service';
import { PurchaseReturnDetailController } from './purchase-return-detail.controller';
import { PurchaseReturnDetail } from './entities/purchase-return-detail.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchaseReturn } from '../purchase-return/entities/purchase-return.entity';

@Module({
  imports: [SequelizeModule.forFeature([PurchaseReturn, PurchaseReturnDetail])],
  controllers: [PurchaseReturnDetailController],
  providers: [PurchaseReturnDetailService],
})
export class PurchaseReturnDetailModule {}
