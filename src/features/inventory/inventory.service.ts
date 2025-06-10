import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    private response: ResponseHelper,
    @InjectModel(Inventory)
    private inventoryModel: typeof Inventory,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.inventoryModel,
      query,
    )
      .load('product.product_images')
      .getResult();

    const result = {
      count: count,
      inventories: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve inventories',
    );
  }

  async findOne(id: number) {
    try {
      const inventory = await this.inventoryModel.findOne({
        where: { id },
        include: [
          {
            association: 'inventory_in_transactions',
            include: [{ association: 'inventory_out_transactions' }],
          },
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
        ],
      });
      return this.response.success(
        inventory,
        200,
        ' Successfully get inventory',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
