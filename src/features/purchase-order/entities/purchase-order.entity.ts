import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchaseOrderDetail } from 'src/features/purchase-order-detail/entities/purchase-order-detail.entity';
import { PurchaseOrderDocument } from 'src/features/purchase-order-document/entities/purchase-order-document.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';
import { User } from 'src/features/user/entities/user.entity';
import PurchaseOrderStatus, {
  getPurchaseOrderStatusEnumLabel,
} from '../enum/purchase-order-status.enum';
import { Branch } from 'src/features/branch/entities/branch.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'purchase_orders',
  modelName: 'purchase_orders',
})
export class PurchaseOrder extends Model {
  @Column({ type: DataType.STRING, unique: true })
  purchase_order_no: string;

  @ForeignKey(() => Supplier)
  @Column(DataType.BIGINT)
  supplier_id: number;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.DATE)
  expected_delivery_date: Date;

  @Column({ type: DataType.TINYINT, defaultValue: PurchaseOrderStatus.PENDING })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: PurchaseOrder) {
      return getPurchaseOrderStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  subtotal: number;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  tax: number;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  grandtotal: number;

  @Column(DataType.STRING)
  note: string;

  @ForeignKey(() => Branch)
  @Column(DataType.BIGINT)
  branch_id: number;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  created_by: number;

  @Column(DataType.DATE)
  approved_at: Date;

  @Column(DataType.DATE)
  created_at: Date;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  approved_by: number;

  @HasMany(() => PurchaseOrderDetail)
  purchase_order_details: PurchaseOrderDetail[];

  @HasMany(() => PurchaseOrderDocument)
  purchase_order_documents: PurchaseOrderDocument[];

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @BelongsTo(() => Branch)
  branch: Branch;

  @BelongsTo(() => User, { foreignKey: 'created_by' })
  created_by_user: User;

  @BelongsTo(() => User, { foreignKey: 'approved_by' })
  approved_by_user: User;

  static searchable = [
    'note',
    'supplier.name',
    'supplier.address',
    'supplier.contact_no',
    'purchase_order_no',
  ];
}
