import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Inventory } from 'src/features/inventory/entities/inventory.entity';
import InventoryHistoryTypeEnum, {
  getInventoryHistoryTypeEnumLabel,
} from '../enums/inventory-history-type.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'inventory_histories',
  modelName: 'inventory_histories',
})
export class InventoryHistory extends Model {
  @ForeignKey(() => Inventory)
  @Column(DataType.BIGINT)
  inventory_id: number;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.BIGINT)
  able_id: number;

  @Column(DataType.STRING)
  able_model: string;

  @Column(DataType.TINYINT)
  type: InventoryHistoryTypeEnum;

  @Column({
    type: DataType.VIRTUAL,
    get(this: InventoryHistory) {
      return getInventoryHistoryTypeEnumLabel(+this.getDataValue('type'));
    },
  })
  type_name: string;

  @Column(DataType.INTEGER)
  quantity_change: number;

  @Column(DataType.INTEGER)
  remaining_quantity: number;

  @BelongsTo(() => Inventory)
  inventory: Inventory;
}
