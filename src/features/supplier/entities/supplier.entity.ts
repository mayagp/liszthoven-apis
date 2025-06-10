import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { SupplierBankAccount } from 'src/features/supplier-bank-account/entities/supplier-bank-account.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'suppliers',
  modelName: 'suppliers',
})
export class Supplier extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  address: string;

  @Column(DataType.STRING)
  contact_no: string;

  @Column(DataType.STRING)
  pic: string;

  @Column(DataType.STRING)
  tax_no: string;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0 })
  total_payable: number;

  @HasMany(() => SupplierBankAccount)
  supplier_bank_accounts: SupplierBankAccount[];
}
