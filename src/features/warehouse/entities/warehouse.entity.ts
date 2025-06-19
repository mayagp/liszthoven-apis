import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Branch } from 'src/features/branch/entities/branch.entity';
import { Inventory } from 'src/features/inventory/entities/inventory.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'warehouses',
  modelName: 'warehouses',
})
export class Warehouse extends Model {
  @ForeignKey(() => Branch)
  @Column(DataType.BIGINT)
  branch_id: number;

  @Column({ type: DataType.STRING, unique: true })
  code: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.TEXT)
  location: string;

  @HasMany(() => Inventory)
  inventories: Inventory[];

  @BelongsTo(() => Branch)
  branch: Branch[];
}
