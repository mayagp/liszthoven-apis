import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchaseReturnDetail } from 'src/features/purchase-return-detail/entities/purchase-return-detail.entity';
import { PurchaseReturnDocument } from 'src/features/purchase-return-document/entities/purchase-return-document.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';
import { getPurchaseReturnDestinationEnumLabel } from '../enum/purchase-return-destination.enum';
import { getPurchaseReturnTypeEnumLabel } from '../enum/purchase-return-type.enum';
import PurchaseReturnStatus, {
  getPurchaseReturnStatusEnumLabel,
} from '../enum/purchase-return-status.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'purchase_returns',
  modelName: 'purchase_returns',
})
export class PurchaseReturn extends Model {
  @ForeignKey(() => Supplier)
  @Column(DataType.BIGINT)
  supplier_id: number;

  @Column({ type: DataType.STRING, unique: true })
  purchase_return_no: string;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.TEXT)
  note: string;

  @Column({ type: DataType.TINYINT })
  type: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: PurchaseReturn) {
      return getPurchaseReturnTypeEnumLabel(+this.getDataValue('type'));
    },
  })
  type_name: string;

  @Column({ type: DataType.DECIMAL(16, 2), defaultValue: 0 })
  amount: number;

  @Column({ type: DataType.TINYINT, defaultValue: PurchaseReturnStatus.DRAFT })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: PurchaseReturn) {
      return getPurchaseReturnStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @Column(DataType.TINYINT)
  destination: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: PurchaseReturn) {
      return getPurchaseReturnDestinationEnumLabel(
        +this.getDataValue('destination'),
      );
    },
  })
  destination_name: string;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @HasMany(() => PurchaseReturnDetail, { hooks: true })
  purchase_return_details: PurchaseReturnDetail[];

  @HasMany(() => PurchaseReturnDocument)
  purchase_return_documents: PurchaseReturnDocument[];

  static searchable = [
    'note',
    'supplier.name',
    'supplier.address',
    'supplier.contact_no',
    'purchase_return_no',
  ];
}
