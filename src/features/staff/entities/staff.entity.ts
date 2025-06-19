import {
  ForeignKey,
  Column,
  DataType,
  Table,
  Model,
  BelongsTo,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from 'src/features/user/entities/user.entity';
import { getUserRoleEnumLabel } from '../enums/user-role.enum';
import { getStaffStatusEnumLabel } from '../enums/staff-status.enum';
import { Branch } from 'src/features/branch/entities/branch.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'staff',
  modelName: 'staff',
})
export class Staff extends Model {
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  user_id: number;

  @Column(DataType.STRING)
  note: string;

  @Column(DataType.TINYINT)
  role: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Staff) {
      return getUserRoleEnumLabel(this.getDataValue('role'));
    },
  })
  role_name: string;

  @Column(DataType.STRING)
  identification_number: string;

  @Column(DataType.STRING)
  tax_number: string;

  @Column(DataType.STRING)
  bpjs_number: string;

  @Column(DataType.DATE)
  working_since: Date;

  @Column(DataType.TINYINT)
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Staff) {
      return getStaffStatusEnumLabel(this.getDataValue('status'));
    },
  })
  status_name: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Branch)
  @Column
  branch_id: number;

  @BelongsTo(() => Branch)
  branch: Branch;

  static searchable = [
    'user.name',
    'user.phone_no',
    'user.address',
    'user.email',
  ];
}
