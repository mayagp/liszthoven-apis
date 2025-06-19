import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { GoodsReceiptDetail } from 'src/features/goods-receipt-detail/entities/goods-receipt-detail.entity';
import { GoodsReceiptDocument } from 'src/features/goods-receipt-document/entities/goods-receipt-document.entity';
import { PurchaseInvoice } from 'src/features/purchase-invoice/entities/purchase-invoice.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';
import { Warehouse } from 'src/features/warehouse/entities/warehouse.entity';
import { getGoodsReceiptEnumLabel } from '../enum/goods-receipt-status.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'goods_receipts',
  modelName: 'goods_receipts',
})
export class GoodsReceipt extends Model {
  @ForeignKey(() => PurchaseInvoice)
  @Column(DataType.BIGINT)
  purchase_invoice_id: number;

  @Column({ type: DataType.STRING, unique: true })
  goods_receipt_no: string;

  @ForeignKey(() => Supplier)
  @Column(DataType.BIGINT)
  supplier_id: number;

  @ForeignKey(() => Warehouse)
  @Column(DataType.BIGINT)
  warehouse_id: number;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.STRING)
  note: string;

  @Column(DataType.TINYINT)
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: GoodsReceipt) {
      return getGoodsReceiptEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @Column(DataType.DATE)
  created_at: Date;

  @Column(DataType.DATE)
  updated_at: Date;

  @BelongsTo(() => PurchaseInvoice)
  purchase_invoice: PurchaseInvoice;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @BelongsTo(() => Warehouse)
  warehouse: Warehouse;

  @HasMany(() => GoodsReceiptDetail)
  goods_receipt_details: GoodsReceiptDetail[];

  @HasMany(() => GoodsReceiptDocument)
  goods_receipt_documents: GoodsReceiptDocument[];

  static searchable = [
    'supplier.name',
    'supplier.address',
    'supplier.contact_no',
    'warehouse.name',
    'warehouse.code',
    'purchase_invoice.invoice_no',
  ];
}
