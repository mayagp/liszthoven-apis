import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'supplier_bank_accounts',
  modelName: 'supplier_bank_accounts',
})
export class SupplierBankAccount extends Model {
  @ForeignKey(() => Supplier)
  @Column(DataType.STRING)
  supplier_id: string;

  @Column(DataType.STRING)
  account_no: string;

  @Column(DataType.STRING)
  bank: string;
}
