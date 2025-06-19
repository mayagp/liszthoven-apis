import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { GoodsReceipt } from 'src/features/goods-receipt/entities/goods-receipt.entity';
import { Product } from 'src/features/product/entities/product.entity';
import { GrSerialNumber } from 'src/features/serialize-item/entities/gr-serial-number.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'goods_receipt_details',
  modelName: 'goods_receipt_details',
})
export class GoodsReceiptDetail extends Model {
  @ForeignKey(() => GoodsReceipt)
  @Column(DataType.BIGINT)
  goods_receipt_id: number;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @Column(DataType.INTEGER)
  quantity: number;

  @BelongsTo(() => GoodsReceipt)
  goods_receipt: GoodsReceipt;

  @BelongsTo(() => Product)
  product: Product;

  @HasMany(() => GrSerialNumber)
  gr_serial_numbers: GrSerialNumber[];
}
