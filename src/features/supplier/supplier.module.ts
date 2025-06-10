import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Supplier } from './entities/supplier.entity';

@Module({
  imports: [SequelizeModule.forFeature([Supplier])],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
