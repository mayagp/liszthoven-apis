import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { InventoryInTransaction } from './inventory-in-transaction.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'inventory_out_transactions',
  modelName: 'inventory_out_transactions',
})
export class InventoryOutTransaction extends Model {
  @ForeignKey(() => InventoryInTransaction)
  @Column(DataType.BIGINT)
  inventory_in_transaction_id: number;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.BIGINT)
  outable_id: number;

  @Column(DataType.STRING)
  outable_type: string;

  @Column(DataType.INTEGER)
  quantity: number;

  @BelongsTo(() => InventoryInTransaction)
  inventory_in_transaction: InventoryInTransaction;
}
