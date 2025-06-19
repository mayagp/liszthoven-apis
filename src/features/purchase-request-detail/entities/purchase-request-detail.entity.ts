import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from 'src/features/product/entities/product.entity';
import { PurchaseRequest } from 'src/features/purchase-request/entities/purchase-request.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'purchase_request_details',
  modelName: 'purchase_request_details',
})
export class PurchaseRequestDetail extends Model {
  @ForeignKey(() => PurchaseRequest)
  @Column(DataType.BIGINT)
  purchase_request_id: number;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @Column(DataType.INTEGER)
  quantity: number;

  @BelongsTo(() => PurchaseRequest)
  purchase_request: PurchaseRequest;

  @BelongsTo(() => Product)
  product: Product;
}
