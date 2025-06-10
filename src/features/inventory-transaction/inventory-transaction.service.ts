import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction, Op } from 'sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import ValuationMethodEnum from '../product/enum/valuation-method.enum';
import { Sequelize } from 'sequelize-typescript';
import { InventoryInTransaction } from './entities/inventory-in-transaction.entity';
import { InventoryOutTransaction } from './entities/inventory-out-transaction.entity';
import { CreateInventoryInDto } from './dto/create-inventory-in.dto';
import { CreateInventoryOutDto } from './dto/create-inventory-out.dto';

@Injectable()
export class InventoryTransactionService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(InventoryInTransaction)
    private inventoryInTransactionModel: typeof InventoryInTransaction,
    @InjectModel(InventoryOutTransaction)
    private inventoryOutTransactionModel: typeof InventoryOutTransaction,
    @InjectModel(Inventory)
    private inventoryModel: typeof Inventory,
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.inventoryInTransactionModel,
      query,
    ).getResult();

    const result = {
      count: count,
      inventory_in_transactions: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve inventory transactions',
    );
  }

  async findOne(id: number) {
    try {
      const inventory = await this.inventoryInTransactionModel.findOne({
        where: { id },
        include: [
          { association: 'inventory_out_transactions' },
          {
            association: 'inventory',
            include: [
              {
                association: 'product',
                include: [{ association: 'product_images' }],
              },
            ],
          },
        ],
      });
      return this.response.success(
        inventory,
        200,
        'Successfully get inventory transaction',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async transactionIn(
    data: CreateInventoryInDto,
    transaction: Transaction,
  ): Promise<InventoryInTransaction> {
    try {
      let inventory = await this.inventoryModel.findOne({
        where: { warehouse_id: data.warehouse_id, product_id: data.product_id },
      });

      if (!inventory) {
        inventory = await this.inventoryModel.create(
          {
            product_id: data.product_id,
            warehouse_id: data.warehouse_id,
            quantity: data.quantity,
          },
          { transaction: transaction },
        );
      } else {
        await inventory.increment('quantity', {
          by: data.quantity,
          transaction: transaction,
        });
      }

      await this.productModel.increment('quantity', {
        by: data.quantity,
        where: { id: data.product_id },
        transaction: transaction,
      });

      const inventoryIn = await this.inventoryInTransactionModel.create(
        {
          ...data,
          remaining_quantity: data.quantity,
          inventory_id: inventory.id,
        },
        { transaction: transaction },
      );
      return inventoryIn;
    } catch (error) {
      throw this.response.fail(error, 400);
    }
  }

  async transactionOut(data: CreateInventoryOutDto, transaction: Transaction) {
    const inventory = await this.inventoryModel.findOne({
      where: { warehouse_id: data.warehouse_id, product_id: data.product_id },
      include: [{ association: 'product' }],
    });

    if (!inventory) {
      return this.response.fail('Product not exists in current warehouse', 400);
    }

    if (data.quantity > inventory.quantity) {
      return this.response.fail('insufficient quantity', 400);
    }

    try {
      let inventoryIns: InventoryInTransaction[];
      if (inventory.product.valuation_method === ValuationMethodEnum.LIFO) {
        inventoryIns = await this.inventoryInTransactionModel.findAll({
          where: {
            inventory_id: inventory.id,
            remaining_quantity: { [Op.gt]: 0 },
          },
          order: [['created_at', 'DESC']],
        });
      } else {
        inventoryIns = await this.inventoryInTransactionModel.findAll({
          where: {
            inventory_id: inventory.id,
            remaining_quantity: { [Op.gt]: 0 },
          },
        });
      }

      let quantity = data.quantity;
      let isBreak = false;

      // check all avaiable inventory in, then decrease remaining quantity until out quantity fullfilled
      for (const inventoryIn of inventoryIns) {
        // define out quantity
        let outQuantity = 0;

        // if quantity more than remaining quantity on current inventoryIn, then decrease remaining quantity and use next inventoryIn
        if (quantity > inventoryIn.remaining_quantity) {
          outQuantity = inventoryIn.remaining_quantity;
          quantity -= +inventoryIn.remaining_quantity;
        } else {
          // if quantity not more than remaining quantity thats mean out quantity fullfilled and prepare to stop the looping (isBreak = true)
          outQuantity = quantity;
          isBreak = true;
        }

        await this.inventoryOutTransactionModel.create(
          {
            ...data,
            product_id: data.product_id,
            warehouse_id: data.warehouse_id,
            quantity: outQuantity,
            outable_id: data.outable_id,
            outable_type: data.outable_type,
            date: data.date,
            inventory_in_transaction_id: inventoryIn.id,
          },
          { transaction: transaction },
        );

        await inventory.product.decrement('quantity', {
          by: outQuantity,
          transaction: transaction,
        });

        await inventoryIn.decrement('remaining_quantity', {
          by: outQuantity,
          transaction: transaction,
        });

        await inventory.decrement('quantity', {
          by: outQuantity,
          transaction: transaction,
        });

        if (isBreak) {
          break;
        }
      }
      return true;
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
