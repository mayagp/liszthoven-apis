import { Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Supplier } from './entities/supplier.entity';
import { Sequelize } from 'sequelize-typescript';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(Supplier)
    private supplierModel: typeof Supplier,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.supplierModel,
      query,
    ).getResult();

    const result = {
      count: count,
      suppliers: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve suppliers',
    );
  }

  async findOne(id: number) {
    try {
      const supplier = await this.supplierModel.findOne({
        where: { id },
        include: [{ association: 'supplier_bank_accounts' }],
      });
      return this.response.success(supplier, 200, ' Successfully get supplier');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createSupplierDto: CreateSupplierDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const supplier = await this.supplierModel.create(
        {
          ...createSupplierDto,
        },
        {
          include: [{ association: 'supplier_bank_accounts' }],
          transaction: transaction,
        },
      );
      await transaction.commit();
      return this.response.success(
        supplier,
        200,
        'Successfully create supplier',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create supplier', 400);
    }
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const supplier = await this.supplierModel.findOne({
        where: { id: id },
      });
      if (!supplier) {
        await transaction.rollback();
        return this.response.fail('Supplier not found', 404);
      }
      await supplier.update(updateSupplierDto, { transaction: transaction });
      await transaction.commit();
      return this.response.success(
        supplier,
        200,
        'Successfully update supplier',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update supplier', 400);
    }
  }

  async delete(id: number) {
    try {
      await this.supplierModel.destroy({
        where: { id },
      });
      return this.response.success({}, 200, ' Successfully delete supplier');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
