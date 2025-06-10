import { Injectable } from '@nestjs/common';
import { CreateInventoryHistoryDto } from './dto/create-inventory-history.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { InventoryHistory } from './entities/inventory-history.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class InventoryHistoryService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(InventoryHistory)
    private inventoryHistoryModel: typeof InventoryHistory,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.inventoryHistoryModel,
      query,
    ).getResult();

    const result = {
      count: count,
      inventory_histories: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve inventory histories',
    );
  }

  async findOne(id: number) {
    try {
      const inventoryHistory = await this.inventoryHistoryModel.findOne({
        where: { id },
      });
      return this.response.success(
        inventoryHistory,
        200,
        ' Successfully get inventory history',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createInventoryHistory: CreateInventoryHistoryDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const inventoryHistory = await this.inventoryHistoryModel.create(
        {
          ...createInventoryHistory,
        },
        { transaction: transaction },
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
