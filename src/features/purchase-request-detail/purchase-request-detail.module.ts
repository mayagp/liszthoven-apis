import { Module } from '@nestjs/common';
import { PurchaseRequestDetailService } from './purchase-request-detail.service';
import { PurchaseRequestDetailController } from './purchase-request-detail.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchaseRequest } from '../purchase-request/entities/purchase-request.entity';
import { PurchaseRequestDetail } from './entities/purchase-request-detail.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([PurchaseRequest, PurchaseRequestDetail]),
  ],
  controllers: [PurchaseRequestDetailController],
  providers: [PurchaseRequestDetailService],
})
export class PurchaseRequestDetailModule {}
