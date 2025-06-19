import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Inventory } from 'src/features/inventory/entities/inventory.entity';
import { Product } from 'src/features/product/entities/product.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'serialize_items',
  modelName: 'serialize_items',
})
export class SerializeItem extends Model {
  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @ForeignKey(() => Inventory)
  @Column(DataType.BIGINT)
  inventory_id: number;

  @Column(DataType.BOOLEAN)
  is_sold: boolean;

  @Column(DataType.DATE)
  warranty_end_date: Date;

  @Column({ type: DataType.STRING, unique: true })
  serial_code: string;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => Inventory)
  inventory: Inventory;
}
