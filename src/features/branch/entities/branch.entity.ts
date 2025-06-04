import {
  Table,
  Column,
  DataType,
  ForeignKey,
  Model,
  BelongsTo,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { City } from 'src/features/city/entities/city.entity';
import { Province } from 'src/features/province/entities/province.entity';
import { Staff } from 'src/features/staff/entities/staff.entity';
import { Subdistrict } from 'src/features/subdistrict/entities/subdistrict.entity';
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

  @Column(DataType.STRING)
  note: string;

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

  @ForeignKey(() => Province)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  province_id: number;

  @ForeignKey(() => City)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  city_id: number;

  @ForeignKey(() => Subdistrict)
  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  subdistrict_id: number;

  @BelongsTo(() => Province)
  province: Province[];

  @BelongsTo(() => City)
  city: City[];

  @BelongsTo(() => Subdistrict)
  subdistrict: Subdistrict[];

  //   @BelongsToMany(() => Company, {
  //     as: 'companies',
  //     through: () => BusinessUnit,
  //   })
  //   companies: Company[];

  @BelongsToMany(() => Staff, {
    as: 'staff',
    through: () => StaffUnit,
  })
  staff: Staff[];

  // @HasMany(() => Staff)
  // staff: Staff[];
}
