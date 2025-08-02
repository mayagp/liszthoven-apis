import {
  AfterCreate,
  AfterFind,
  AfterUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { PurchaseInvoiceDetail } from 'src/features/purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import { PurchaseOrderDetail } from 'src/features/purchase-order-detail/entities/purchase-order-detail.entity';
import { PurchasePlan } from 'src/features/purchase-plan/entities/purchase-plan.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'plan_implements',
  modelName: 'plan_implements',
})
export class PlanImplement extends Model {
  @ForeignKey(() => PurchasePlan)
  @Column(DataType.BIGINT)
  purchase_plan_id: number;

  @Column(DataType.BIGINT)
  planable_id: number;

  @Column(DataType.STRING)
  planable_type: string;

  @Column(DataType.INTEGER)
  quantity: number;

  @BelongsTo(() => PurchasePlan)
  purchase_plan: PurchasePlan;

  @Column({
    type: DataType.VIRTUAL,
  })
  planable: any;

  @AfterFind
  @AfterCreate
  @AfterUpdate
  static async eagerLoadPolymorph(
    result: PlanImplement | PlanImplement[],
    options,
  ) {
    if (!Array.isArray(result)) result = [result];

    for (const instance of result) {
      const arrayPolymorphModel = [
        PurchaseOrderDetail.name,
        PurchaseInvoiceDetail.name,
      ];

      const relations = {
        purchase_order_details: {
          include: [
            { association: 'purchase_order' },
            { association: 'supplier_quotation' },
          ],
        },
        purchase_invoice_details: {
          include: [{ association: 'purchase_invoice' }],
        },
      };

      if (!instance) continue;

      const model = arrayPolymorphModel.find(
        (m) => instance.planable_type === m,
      );

      if (!model) continue;

      if (!this.sequelize) {
        throw new Error('Sequelize instance is not initialized.');
      }

      instance.planable = await this.sequelize
        .model(model)
        .findByPk(instance.planable_id, {
          ...relations[model.toLowerCase()],
        });
    }
  }
}
