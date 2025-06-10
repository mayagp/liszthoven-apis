import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
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
  tableName: 'stock_movements',
  modelName: 'stock_movements',
})
export class StockMovement extends Model {
  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @Column(DataType.INTEGER)
  quantity: number;

  @Column(DataType.DATE)
  date: Date;

  @ForeignKey(() => Warehouse)
  @Column({ type: DataType.BIGINT, allowNull: true })
  from_id: number;

  @ForeignKey(() => Warehouse)
  @Column(DataType.BIGINT)
  to_id: number;

  @Column(DataType.TEXT)
  note: string;

  @Column(DataType.TINYINT)
  type: number;

  @BelongsTo(() => Warehouse, { foreignKey: 'from_id' })
  from: Warehouse;

  @BelongsTo(() => Warehouse, { foreignKey: 'to_id' })
  to: Warehouse;

  @BelongsTo(() => Product)
  product: Product;
}
