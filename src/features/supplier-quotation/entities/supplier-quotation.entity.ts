import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { SupplierQuotationDetail } from 'src/features/supplier-quotation-detail/entities/supplier-quotation-detail.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';
import SupplierQuotationStatus, {
  getSupplierQuotationStatusEnumLabel,
} from '../enum/supplier-quotation-status.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'supplier_quotations',
  modelName: 'supplier_quotations',
})
export class SupplierQuotation extends Model {
  @Column({ type: DataType.STRING })
  quotation_no: string;

  @ForeignKey(() => Supplier)
  @Column(DataType.BIGINT)
  supplier_id: number;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.DATE)
  expected_delivery_date: Date;

  @Column({
    type: DataType.TINYINT,
    defaultValue: SupplierQuotationStatus.REQUESTED,
  })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: SupplierQuotation) {
      return getSupplierQuotationStatusEnumLabel(+this.getDataValue('status'));
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

  @Column(DataType.DATE)
  created_at: Date;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @HasMany(() => SupplierQuotationDetail)
  supplier_quotation_details: SupplierQuotationDetail[];

  static searchable = [
    'note',
    'supplier.name',
    'supplier.address',
    'supplier.contact_no',
    'quotation_no',
  ];
}
