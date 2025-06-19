import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchaseInvoiceDetail } from 'src/features/purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import { PurchaseInvoiceDocument } from 'src/features/purchase-invoice-document/entities/purchase-invoice-document.entity';
import { PurchaseOrder } from 'src/features/purchase-order/entities/purchase-order.entity';
import { PurchasePaymentAllocation } from 'src/features/purchase-payment-allocation/entities/purchase-payment-allocation.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';
import { User } from 'src/features/user/entities/user.entity';
import PurchaseInvoiceStatus, {
  getPurchaseInvoiceStatusEnumLabel,
} from '../enum/purchase-invoice-status.enum';
import { Branch } from 'src/features/branch/entities/branch.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'purchase_invoices',
  modelName: 'purchase_invoices',
})
export class PurchaseInvoice extends Model {
  @Column({ type: DataType.STRING, unique: true })
  invoice_no: string;

  @ForeignKey(() => PurchaseOrder)
  @Column(DataType.BIGINT)
  purchase_order_id: number;

  @ForeignKey(() => Supplier)
  @Column(DataType.BIGINT)
  supplier_id: number;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.DATE)
  due_date: Date;

  @Column({
    type: DataType.TINYINT,
    defaultValue: PurchaseInvoiceStatus.PENDING,
  })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: PurchaseInvoice) {
      return getPurchaseInvoiceStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  subtotal: number;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  tax: number;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  shipping_cost: number;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  grandtotal: number;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  remaining_amount: number;

  @Column(DataType.STRING)
  note: string;

  @ForeignKey(() => Branch)
  @Column(DataType.BIGINT)
  branch_id: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  created_by: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  updated_by: number;

  @HasMany(() => PurchaseInvoiceDetail)
  purchase_invoice_details: PurchaseInvoiceDetail[];

  //   @HasMany(() => PurchasePaymentAllocation)
  //   purchase_payment_allocations: PurchasePaymentAllocation[];

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @BelongsTo(() => PurchaseOrder)
  purchase_order: PurchaseOrder;

  @BelongsTo(() => Branch)
  branch: Branch;

  @BelongsTo(() => User, { foreignKey: 'created_by' })
  created_by_user: User;

  @BelongsTo(() => User, { foreignKey: 'updated_by' })
  updated_by_user: User;

  @HasMany(() => PurchaseInvoiceDocument)
  purchase_invoice_documents: PurchaseInvoiceDocument[];

  static searchable = [
    'note',
    'supplier.name',
    'supplier.address',
    'supplier.contact_no',
    'invoice_no',
  ];
}
