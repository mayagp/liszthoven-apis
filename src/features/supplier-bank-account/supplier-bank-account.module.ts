import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SupplierBankAccountService } from './supplier-bank-account.service';
import { SupplierBankAccountController } from './supplier-bank-account.controller';
import { SupplierBankAccount } from './entities/supplier-bank-account.entity';

@Module({
  imports: [SequelizeModule.forFeature([SupplierBankAccount])],
  controllers: [SupplierBankAccountController],
  providers: [SupplierBankAccountService],
})
export class SupplierBankAccountModule {}
