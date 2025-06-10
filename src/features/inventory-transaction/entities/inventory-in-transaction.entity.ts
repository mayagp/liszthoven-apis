import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { InventoryOutTransaction } from './inventory-out-transaction.entity';
import { Inventory } from 'src/features/inventory/entities/inventory.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'inventory_in_transactions',
  modelName: 'inventory_in_transactions',
})
export class InventoryInTransaction extends Model {
  @ForeignKey(() => Inventory)
  @Column(DataType.BIGINT)
  inventory_id: number;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.BIGINT)
  inable_id: number;

  @Column(DataType.STRING)
  inable_type: string;

  @Column(DataType.INTEGER)
  quantity: number;

  @Column(DataType.INTEGER)
  remaining_quantity: number;

  @Column(DataType.DECIMAL(16, 2))
  cost: number;

  @BelongsTo(() => Inventory)
  inventory: Inventory;

  @HasMany(() => InventoryOutTransaction)
  inventory_out_transactions: InventoryOutTransaction[];
}
