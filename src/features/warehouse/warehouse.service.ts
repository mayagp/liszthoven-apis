import { Injectable } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Warehouse } from './entities/warehouse.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class WarehouseService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(Warehouse)
    private warehouseModel: typeof Warehouse,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.warehouseModel,
      query,
    )
      .load('inventories')
      .getResult();

    const result = {
      count: count,
      warehouses: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve warehouses',
    );
  }

  async findOne(id: number) {
    try {
      const warehouse = await this.warehouseModel.findOne({
        where: { id },
        include: [
          {
            association: 'inventories',
            include: [
              {
                association: 'product',
                include: [{ association: 'product_images' }],
              },
            ],
          },
          {
            association: 'branch',
          },
        ],
      });

      return this.response.success(
        warehouse,
        200,
        'Successfully retrieve warehouse',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createWarehouseDto: CreateWarehouseDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const warehouse = await this.warehouseModel.create(
        {
          ...createWarehouseDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        warehouse,
        200,
        'Successfully create warehouse',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create warehouse', 400);
    }
  }

  async update(id: number, updateWarehouseDto: CreateWarehouseDto) {
    const warehouse = await this.warehouseModel.findOne({
      where: { id: id },
    });

    if (!warehouse) {
      return this.response.fail('Warehouse not found', 404);
    }

    if (updateWarehouseDto.code !== warehouse.code) {
      const checkCode = await this.warehouseModel.findOne({
        where: { code: updateWarehouseDto.code },
      });

      if (checkCode) {
        return this.response.fail('Code already taken', 400);
      }
    }

    const transaction = await this.sequelize.transaction();
    try {
      await warehouse.update(updateWarehouseDto, { transaction });
      await transaction.commit();

      return this.response.success(
        warehouse,
        200,
        'Successfully updated warehouse',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update warehouse', 400);
    }
  }

  async delete(id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      await this.warehouseModel.destroy({
        where: { id },
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success({}, 200, 'Successfully delete warehouse');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
