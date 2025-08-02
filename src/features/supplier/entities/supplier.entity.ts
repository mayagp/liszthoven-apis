import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/features/user/entities/user.entity';

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
  @ForeignKey(() => User)
  @Column
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @Column({ type: DataType.STRING, allowNull: true })
  tax_no: string;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0, allowNull: true })
  total_payable: number;

  @Column(DataType.STRING)
  account_no: string;

  @Column({ type: DataType.STRING, allowNull: true })
  bank: string;

  @Column({ type: DataType.STRING, allowNull: true })
  swift_code: string;
}
