import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from 'src/features/product/entities/product.entity';
import { Warehouse } from 'src/features/warehouse/entities/warehouse.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'inventories',
  modelName: 'inventories',
})
export class Inventory extends Model {
  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @ForeignKey(() => Warehouse)
  @Column(DataType.BIGINT)
  warehouse_id: number;

  @Column(DataType.INTEGER)
  quantity: number;

  //   @HasMany(() => SerializeItem)
  //   serialize_items: SerializeItem[];

  @BelongsTo(() => Warehouse)
  warehouse: Warehouse;

  @BelongsTo(() => Product)
  product: Product;

  //   @HasMany(() => InventoryInTransaction)
  //   inventory_in_transactions: InventoryInTransaction[];
}
