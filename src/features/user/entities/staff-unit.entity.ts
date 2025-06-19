import {
  Model,
  BelongsTo,
  Table,
  ForeignKey,
  Column,
  DataType,
} from 'sequelize-typescript';
import { Branch } from 'src/features/branch/entities/branch.entity';
import { Staff } from 'src/features/staff/entities/staff.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'staff_units',
  modelName: 'staff_units',
})
export class StaffUnit extends Model {
  @ForeignKey(() => Branch)
  @Column(DataType.BIGINT)
  branch_id: number;

  @ForeignKey(() => Staff)
  @Column(DataType.BIGINT)
  staff_id: number;

  @BelongsTo(() => Staff)
  staff: Staff;

  @BelongsTo(() => Branch)
  branch: Branch;
}
