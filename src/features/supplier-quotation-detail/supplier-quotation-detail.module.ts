import { Module } from '@nestjs/common';
import { SupplierQuotationDetailService } from './supplier-quotation-detail.service';
import { SupplierQuotationDetailController } from './supplier-quotation-detail.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SupplierQuotation } from '../supplier-quotation/entities/supplier-quotation.entity';
import { SupplierQuotationDetail } from './entities/supplier-quotation-detail.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([SupplierQuotationDetail, SupplierQuotation]),
  ],
  controllers: [SupplierQuotationDetailController],
  providers: [SupplierQuotationDetailService],
})
export class SupplierQuotationDetailModule {}
