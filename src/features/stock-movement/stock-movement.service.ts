import { Injectable } from '@nestjs/common';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { InventoryInTransaction } from '../inventory-transaction/entities/inventory-in-transaction.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { Sequelize } from 'sequelize-typescript';
import { InventoryTransactionService } from '../inventory-transaction/inventory-transaction.service';

@Injectable()
export class StockMovementService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(StockMovement)
    private stockMovementModel: typeof StockMovement,
    @InjectModel(Inventory)
    private inventoryModel: typeof Inventory,
    @InjectModel(InventoryInTransaction)
    private inventoryInTransactionModel: typeof InventoryInTransaction,
    private inventoryTransactionService: InventoryTransactionService,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.stockMovementModel,
      query,
    )
      .load('product.product_images', 'from', 'to')
      .getResult();

    const result = {
      count: count,
      stock_movements: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve stock movement',
    );
  }

  async findOne(id: number) {
    try {
      const stockMovement = await this.stockMovementModel.findOne({
        where: { id },
      });
      return this.response.success(
        stockMovement,
        200,
        ' Successfully get stock movement',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createStockMovementDto: CreateStockMovementDto) {
    const from = await this.inventoryModel.findOne({
      where: {
        warehouse_id: createStockMovementDto.from_id,
        product_id: createStockMovementDto.product_id,
      },
    });

    if (!from) {
      const product = await Product.findByPk(createStockMovementDto.product_id);
      const productName = product?.name || 'Product';
      const warehouseName = 'Specified'; // Since `from` is null, we can't get warehouse name
      return this.response.fail(
        `${productName} does not exist in ${warehouseName} warehouse`,
        400,
      );
    }

    if (from.quantity < createStockMovementDto.quantity) {
      await from.reload({ include: [{ association: 'warehouse' }] });
      this.response.fail(
        `Insufficient quantity from ${from.warehouse.name} warehouse`,
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      const inventoryIn = await this.inventoryInTransactionModel.findOne({
        where: {
          inventory_id: from.id,
        },
      });

      const stockMovement = await this.stockMovementModel.create(
        {
          ...createStockMovementDto,
        },
        { transaction: transaction },
      );

      await this.inventoryTransactionService.transactionIn(
        {
          warehouse_id: createStockMovementDto.to_id,
          product_id: createStockMovementDto.product_id,
          quantity: createStockMovementDto.quantity,
          inable_id: stockMovement.id,
          inable_type: StockMovement.name,
          cost: inventoryIn?.cost ?? 0,
          date: createStockMovementDto.date,
        },
        transaction,
      );

      await this.inventoryTransactionService.transactionOut(
        {
          warehouse_id: createStockMovementDto.from_id,
          product_id: createStockMovementDto.product_id,
          quantity: createStockMovementDto.quantity,
          outable_id: stockMovement.id,
          outable_type: StockMovement.name,
          date: createStockMovementDto.date,
        },
        transaction,
      );

      await transaction.commit();
      return this.response.success(
        stockMovement,
        200,
        'Successfully create stock movement',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create stock movement', 400);
    }
  }
}
