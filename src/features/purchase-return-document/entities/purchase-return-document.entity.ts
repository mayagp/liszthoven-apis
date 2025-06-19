import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchaseReturn } from 'src/features/purchase-return/entities/purchase-return.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'purchase_return_documents',
  modelName: 'purchase_return_documents',
})
export class PurchaseReturnDocument extends Model {
  @ForeignKey(() => PurchaseReturn)
  @Column(DataType.BIGINT)
  purchase_return_id: number;

  @Column(DataType.STRING)
  original_name: string;

  @Column(DataType.STRING)
  url: string;

  @Column(DataType.STRING)
  path: string;

  @Column(DataType.STRING)
  extension: string;

  @BelongsTo(() => PurchaseReturn)
  purchase_return: PurchaseReturn;
}
