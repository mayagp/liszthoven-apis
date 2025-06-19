import { Module } from '@nestjs/common';
import { PurchaseRequestService } from './purchase-request.service';
import { PurchaseRequestController } from './purchase-request.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutoNumberService } from '../auto-number/auto-number.service';
import { AutoNumber } from '../auto-number/entities/auto-number.entity';
import { PurchaseRequestDetail } from '../purchase-request-detail/entities/purchase-request-detail.entity';
import { PurchaseRequest } from './entities/purchase-request.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PurchaseRequest,
      PurchaseRequestDetail,
      AutoNumber,
    ]),
  ],
  controllers: [PurchaseRequestController],
  providers: [PurchaseRequestService, AutoNumberService],
})
export class PurchaseRequestModule {}
