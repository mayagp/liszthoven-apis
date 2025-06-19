import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from 'src/features/product/entities/product.entity';
import { PurchaseInvoice } from 'src/features/purchase-invoice/entities/purchase-invoice.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'purchase_invoice_details',
  modelName: 'purchase_invoice_details',
})
export class PurchaseInvoiceDetail extends Model {
  @ForeignKey(() => PurchaseInvoice)
  @Column(DataType.BIGINT)
  purchase_invoice_id: number;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @Column(DataType.INTEGER)
  quantity: number;

  @Column(DataType.INTEGER)
  remaining_quantity: number;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  unit_price: number;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  subtotal: number;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => PurchaseInvoice)
  purchase_invoice: PurchaseInvoice;
}
