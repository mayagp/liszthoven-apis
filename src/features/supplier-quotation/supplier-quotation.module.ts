import { Module } from '@nestjs/common';
import { SupplierQuotationService } from './supplier-quotation.service';
import { SupplierQuotationController } from './supplier-quotation.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SupplierQuotationDetail } from '../supplier-quotation-detail/entities/supplier-quotation-detail.entity';
import { SupplierQuotation } from './entities/supplier-quotation.entity';
import { Supplier } from '../supplier/entities/supplier.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SupplierQuotation,
      SupplierQuotationDetail,
      Supplier,
    ]),
  ],
  controllers: [SupplierQuotationController],
  providers: [SupplierQuotationService],
})
export class SupplierQuotationModule {}
