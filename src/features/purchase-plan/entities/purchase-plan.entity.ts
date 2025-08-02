import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from 'src/features/product/entities/product.entity';
import { Warehouse } from 'src/features/warehouse/entities/warehouse.entity';
import PurchasePlanStatus, {
  getPurchasePlanStatusEnumLabel,
} from '../enum/purchase-plan-status.enum';
import { PlanImplement } from 'src/features/plan-implement/entities/plan-implement.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'purchase_plans',
  modelName: 'purchase_plans',
})
export class PurchasePlan extends Model {
  @ForeignKey(() => Warehouse)
  @Column(DataType.BIGINT)
  warehouse_id: number;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @Column(DataType.DATE)
  date: Date;

  @Column(DataType.INTEGER)
  quantity: number;

  @Column({ type: DataType.TINYINT, defaultValue: PurchasePlanStatus.CREATED })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: PurchasePlan) {
      return getPurchasePlanStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => Warehouse)
  warehouse: Warehouse;

  @HasMany(() => PlanImplement, { hooks: true })
  plan_implements: PlanImplement[];

  static searchable = ['product.name', 'warehouse.name', 'warehouse.code'];
}
