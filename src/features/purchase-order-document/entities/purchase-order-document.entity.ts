import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchaseOrder } from 'src/features/purchase-order/entities/purchase-order.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'purchase_order_documents',
  modelName: 'purchase_order_documents',
})
export class PurchaseOrderDocument extends Model {
  @ForeignKey(() => PurchaseOrder)
  @Column(DataType.BIGINT)
  purchase_order_id: number;

  @Column(DataType.STRING)
  original_name: string;

  @Column(DataType.STRING)
  url: string;

  @Column(DataType.STRING)
  path: string;

  @Column(DataType.STRING)
  extension: string;

  @BelongsTo(() => PurchaseOrder)
  purchase_order: PurchaseOrder;
}
