import { Module } from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { StockMovementController } from './stock-movement.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { InventoryInTransaction } from '../inventory-transaction/entities/inventory-in-transaction.entity';
import { InventoryOutTransaction } from '../inventory-transaction/entities/inventory-out-transaction.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { InventoryTransactionService } from '../inventory-transaction/inventory-transaction.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      StockMovement,
      Inventory,
      InventoryInTransaction,
      InventoryOutTransaction,
      Product,
    ]),
  ],
  controllers: [StockMovementController],
  providers: [StockMovementService, InventoryTransactionService],
})
export class StockMovementModule {}
