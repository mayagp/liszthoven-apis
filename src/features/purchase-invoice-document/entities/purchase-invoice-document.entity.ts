import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchaseInvoice } from 'src/features/purchase-invoice/entities/purchase-invoice.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'purchase_invoice_documents',
  modelName: 'purchase_invoice_documents',
})
export class PurchaseInvoiceDocument extends Model {
  @ForeignKey(() => PurchaseInvoice)
  @Column(DataType.BIGINT)
  purchase_invoice_id: number;

  @Column(DataType.STRING)
  original_name: string;

  @Column(DataType.STRING)
  url: string;

  @Column(DataType.STRING)
  path: string;

  @Column(DataType.STRING)
  extension: string;

  @BelongsTo(() => PurchaseInvoice)
  purchase_invoice: PurchaseInvoice;
}
