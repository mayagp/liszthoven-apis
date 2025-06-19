import { Module } from '@nestjs/common';
import { SerializeItemService } from './serialize-item.service';
import { SerializeItemController } from './serialize-item.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../product/entities/product.entity';
import { SerializeItem } from './entities/serialize-item.entity';

@Module({
  imports: [SequelizeModule.forFeature([SerializeItem, Inventory, Product])],
  controllers: [SerializeItemController],
  providers: [SerializeItemService],
})
export class SerializeItemModule {}
