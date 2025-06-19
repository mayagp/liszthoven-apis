import {
  Table,
  Column,
  DataType,
  Model,
  BelongsToMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Staff } from 'src/features/staff/entities/staff.entity';
import { StaffUnit } from 'src/features/user/entities/staff-unit.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'branches',
  modelName: 'branches',
})
export class Branch extends Model {
  @Column({ type: DataType.STRING, allowNull: true })
  name: string;

  @Column(DataType.STRING)
  address: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phone: string;

  @Column({ type: DataType.STRING, allowNull: true })
  electric_bill_no: string;

  @Column({ type: DataType.STRING, allowNull: true })
  water_bill_no: string;

  @Column({ type: DataType.STRING, allowNull: true })
  internet_bill_no: string;

  // @BelongsToMany(() => Staff, {
  //   as: 'staff',
  //   through: () => StaffUnit,
  // })
  // staff: Staff[];
}
