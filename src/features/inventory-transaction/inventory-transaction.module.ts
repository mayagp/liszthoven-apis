import { Module } from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';
import { InventoryTransactionController } from './inventory-transaction.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { InventoryOutTransaction } from './entities/inventory-out-transaction.entity';
import { InventoryInTransaction } from './entities/inventory-in-transaction.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      InventoryInTransaction,
      InventoryOutTransaction,
      Inventory,
      Product,
    ]),
  ],
  controllers: [InventoryTransactionController],
  providers: [InventoryTransactionService],
})
export class InventoryTransactionModule {}
