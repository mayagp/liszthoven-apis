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
import { GoodsReceiptDetail } from 'src/features/goods-receipt-detail/entities/goods-receipt-detail.entity';
import { PurchaseInvoiceDetail } from 'src/features/purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import { PurchaseReturn } from 'src/features/purchase-return/entities/purchase-return.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'purchase_return_details',
  modelName: 'purchase_return_details',
})
export class PurchaseReturnDetail extends Model {
  @ForeignKey(() => PurchaseReturn)
  @Column(DataType.BIGINT)
  purchase_return_id: number;

  @Column(DataType.BIGINT)
  purchaseable_id: number;

  @Column(DataType.BIGINT)
  purchaseable_type: string;

  @Column(DataType.INTEGER)
  quantity: number;

  @Column(DataType.DECIMAL)
  amount: number;

  @Column({
    type: DataType.VIRTUAL,
  })
  purchaseable: any;

  @BelongsTo(() => PurchaseReturn)
  purchase_return: PurchaseReturn;

  @AfterFind
  @AfterCreate
  @AfterUpdate
  static async eagerLoadPolymorph(
    result: PurchaseReturnDetail | PurchaseReturnDetail[],
    options,
  ) {
    if (!Array.isArray(result)) result = [result];
    for (const instance of result) {
      const arrayPolymorphModel = [
        GoodsReceiptDetail.name,
        PurchaseInvoiceDetail.name,
      ];
      const relations = {
        goods_receipt_details: {
          include: [
            {
              association: 'goods_receipt',
            },
            {
              association: 'product',
              include: [{ association: 'product_images' }],
            },
          ],
        },
        purchase_invoice_details: {
          include: [
            {
              association: 'purchase_invoice',
            },
            {
              association: 'product',
              include: [{ association: 'product_images' }],
            },
          ],
        },
      };

      if (!this.sequelize) {
        throw new Error('Sequelize instance is not initialized');
      }

      if (instance) {
        const model = arrayPolymorphModel.find(
          (m) => instance.purchaseable_type === m,
        );

        if (model) {
          instance.purchaseable = await this.sequelize
            .model(model)
            .findByPk(instance.purchaseable_id, {
              ...relations[model],
            });
        } else {
          // Optional: handle case where no matching model was found
          throw new Error(
            `Model not found for type: ${instance.purchaseable_type}`,
          );
        }
      }
    }
  }
}
