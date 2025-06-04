import {
  ForeignKey,
  Column,
  DataType,
  Table,
  Model,
  BelongsTo,
  BelongsToMany,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import { StaffUnit } from 'src/features/user/entities/staff-unit.entity';
import { User } from 'src/features/user/entities/user.entity';
import { getReligionEnumLabel } from '../enums/religion.enum';
import { getStaffRoleEnumLabel } from '../enums/staff-role.enum';
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
      return getStaffRoleEnumLabel(this.getDataValue('role'));
    },
  })
  role_name: string;

  @Column(DataType.DECIMAL(16, 2))
  basic_salary: number;

  @Column(DataType.STRING)
  identification_number: string;

  @Column(DataType.STRING)
  tax_number: string;

  @Column(DataType.STRING)
  bpjs_number: string;

  @Column(DataType.DATE)
  working_since: Date;

  @Column(DataType.STRING)
  bank_name: string;

  @Column(DataType.STRING)
  bank_account_number: string;

  @Column(DataType.STRING)
  bank_account_name: string;

  @Column(DataType.TINYINT)
  religion: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Staff) {
      return getReligionEnumLabel(this.getDataValue('religion'));
    },
  })
  religion_name: string;

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

  //   @BelongsTo(() => TaxCategory)
  //   tax_category: TaxCategory;

  //   @BelongsToMany(() => BusinessUnit, {
  //     as: 'business_units',
  //     through: () => StaffUnit,
  //   })
  //   business_units: BusinessUnit[];

  @BelongsToMany(() => Branch, {
    as: 'branches',
    through: () => StaffUnit,
  })
  branches: Branch[];

  // @ForeignKey(() => Branch)
  // @Column
  // branchId: number;

  // @BelongsTo(() => Branch)
  // branch: Branch;

  static searchable = [
    'user.name',
    'user.phone_no',
    'user.address',
    'user.email',
  ];
}
