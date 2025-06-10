import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { SupplierBankAccount } from './entities/supplier-bank-account.entity';
import { Sequelize } from 'sequelize-typescript';
import { CreateSupplierBankAccountDto } from './dto/create-supplier-bank-account.dto';

@Injectable()
export class SupplierBankAccountService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(SupplierBankAccount)
    private supplierBankAccountModel: typeof SupplierBankAccount,
  ) {}

  async create(
    supplierId: number,
    createSupplierBankAccountDto: CreateSupplierBankAccountDto,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const supplierBankAccount = await this.supplierBankAccountModel.create(
        {
          ...createSupplierBankAccountDto,
          supplier_id: supplierId,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        supplierBankAccount,
        200,
        'Successfully create supplier bank account',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create supplier bank account', 400);
    }
  }

  async update(
    supplierId: number,
    id: number,
    updateSupplierBankAccountDto: CreateSupplierBankAccountDto,
  ) {
    const supplierBankAccount = await this.supplierBankAccountModel.findOne({
      where: { supplier_id: supplierId, id: id },
    });

    if (!supplierBankAccount) {
      return this.response.fail(
        'Supplier not belongs to this bank account',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      await supplierBankAccount.update(updateSupplierBankAccountDto, {
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        supplierBankAccount,
        200,
        'Successfully update supplier bank account',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update supplier bank account', 400);
    }
  }

  async delete(supplierId: number, id: number) {
    try {
      await this.supplierBankAccountModel.destroy({
        where: { id: id, supplier_id: supplierId },
      });
      return this.response.success(
        {},
        200,
        ' Successfully delete supplier bank account',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
