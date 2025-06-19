import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { GoodsReceipt } from 'src/features/goods-receipt/entities/goods-receipt.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'goods_receipt_documents',
  modelName: 'goods_receipt_documents',
})
export class GoodsReceiptDocument extends Model {
  @ForeignKey(() => GoodsReceipt)
  @Column(DataType.BIGINT)
  goods_receipt_id: number;

  @Column(DataType.STRING)
  original_name: string;

  @Column(DataType.STRING)
  url: string;

  @Column(DataType.STRING)
  path: string;

  @Column(DataType.STRING)
  extension: string;

  @BelongsTo(() => GoodsReceipt)
  goods_receipt: GoodsReceipt;
}
