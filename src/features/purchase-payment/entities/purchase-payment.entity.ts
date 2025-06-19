import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchasePaymentAllocation } from 'src/features/purchase-payment-allocation/entities/purchase-payment-allocation.entity';
import { PurchasePaymentDocument } from 'src/features/purchase-payment-document/entities/purchase-payment-document.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';
import { User } from 'src/features/user/entities/user.entity';
import PurchasePaymentStatus, {
  getPurchasePaymentStatusEnumLabel,
} from '../enum/purchase-payment-status.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'purchase_payments',
  modelName: 'purchase_payments',
})
export class PurchasePayment extends Model {
  @ForeignKey(() => Supplier)
  @Column(DataType.BIGINT)
  supplier_id: number;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.STRING)
  payment_method: string;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  amount_paid: number;

  @Column(DataType.STRING)
  note: string;

  @Column({
    type: DataType.TINYINT,
    defaultValue: PurchasePaymentStatus.DRAFT,
  })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: PurchasePayment) {
      return getPurchasePaymentStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  created_by: number;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @BelongsTo(() => User, { foreignKey: 'created_by' })
  created_by_user: User;

  @HasMany(() => PurchasePaymentAllocation)
  purchase_payment_allocations: PurchasePaymentAllocation[];

  @HasMany(() => PurchasePaymentDocument)
  purchase_payment_documents: PurchasePaymentDocument[];

  static searchable = [
    'note',
    'supplier.name',
    'supplier.address',
    'supplier.contact_no',
    'payment_method',
  ];
}
