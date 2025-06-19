import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchaseInvoice } from 'src/features/purchase-invoice/entities/purchase-invoice.entity';
import { PurchasePayment } from 'src/features/purchase-payment/entities/purchase-payment.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'purchase_payment_allocations',
  modelName: 'purchase_payment_allocations',
})
export class PurchasePaymentAllocation extends Model {
  @ForeignKey(() => PurchasePayment)
  @Column(DataType.BIGINT)
  purchase_payment_id: number;

  @ForeignKey(() => PurchaseInvoice)
  @Column(DataType.BIGINT)
  purchase_invoice_id: number;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  amount_allocated: number;

  @BelongsTo(() => PurchasePayment)
  purchase_payment: PurchasePayment;

  @BelongsTo(() => PurchaseInvoice)
  purchase_invoice: PurchaseInvoice;
}
