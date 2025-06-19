import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchasePayment } from 'src/features/purchase-payment/entities/purchase-payment.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'purchase_payment_documents',
  modelName: 'purchase_payment_documents',
})
export class PurchasePaymentDocument extends Model {
  @ForeignKey(() => PurchasePayment)
  @Column(DataType.BIGINT)
  purchase_payment_id: number;

  @Column(DataType.STRING)
  original_name: string;

  @Column(DataType.STRING)
  url: string;

  @Column(DataType.STRING)
  path: string;

  @Column(DataType.STRING)
  extension: string;

  @BelongsTo(() => PurchasePayment)
  purchase_payment: PurchasePayment;
}
