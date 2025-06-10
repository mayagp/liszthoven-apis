import { Module } from '@nestjs/common';
import { InventoryHistoryService } from './inventory-history.service';
import { InventoryHistoryController } from './inventory-history.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { InventoryHistory } from './entities/inventory-history.entity';

@Module({
  imports: [SequelizeModule.forFeature([InventoryHistory])],
  controllers: [InventoryHistoryController],
  providers: [InventoryHistoryService],
})
export class InventoryHistoryModule {}
