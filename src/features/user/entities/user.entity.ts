import {
  Table,
  DefaultScope,
  Column,
  DataType,
  HasOne,
  Model,
} from 'sequelize-typescript';
import { Staff } from 'src/features/staff/entities/staff.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'users',
  modelName: 'users',
})
@DefaultScope(() => ({
  attributes: {
    exclude: ['password', 'username'],
  },
}))
export class User extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  phone_no: string;

  @Column(DataType.STRING)
  address: string;

  @Column(DataType.STRING)
  email: string;

  @Column(DataType.STRING)
  username: string;

  @Column(DataType.STRING)
  password: string;

  @HasOne(() => Staff)
  staff: Staff;

  @HasOne(() => Supplier)
  supplier: Supplier;
}
