import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from 'src/features/product/entities/product.entity';
import { PurchaseOrder } from 'src/features/purchase-order/entities/purchase-order.entity';
import { SupplierQuotation } from 'src/features/supplier-quotation/entities/supplier-quotation.entity';
import PurchaseOrderDetailStatus, {
  getPurchaseOrderDetailStatusEnumLabel,
} from '../enum/purchase-order-detail-status.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'purchase_order_details',
  modelName: 'purchase_order_details',
})
export class PurchaseOrderDetail extends Model {
  @Column(DataType.STRING)
  quotation_no: string;

  @ForeignKey(() => SupplierQuotation)
  @Column(DataType.BIGINT)
  supplier_quotation_id: number;

  @ForeignKey(() => PurchaseOrder)
  @Column(DataType.BIGINT)
  purchase_order_id: number;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @Column(DataType.INTEGER)
  quantity_ordered: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  remaining_quantity: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  quantity_received: number;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  price_per_unit: number;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  total: number;

  @Column({ type: DataType.DATE, defaultValue: null })
  expected_delivery_date: Date;

  @Column({
    type: DataType.TINYINT,
    defaultValue: PurchaseOrderDetailStatus.CREATED,
  })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: PurchaseOrderDetail) {
      return getPurchaseOrderDetailStatusEnumLabel(
        +this.getDataValue('status'),
      );
    },
  })
  status_name: string;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => PurchaseOrder)
  purchase_order: PurchaseOrder;

  @BelongsTo(() => SupplierQuotation)
  supplier_quotation: SupplierQuotation;
}
