import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { GoodsReceiptDetail } from 'src/features/goods-receipt-detail/entities/goods-receipt-detail.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'gr_serial_numbers',
  modelName: 'gr_serial_numbers',
})
export class GrSerialNumber extends Model {
  @ForeignKey(() => GoodsReceiptDetail)
  @Column(DataType.BIGINT)
  goods_receipt_detail_id: number;

  @Column(DataType.STRING)
  serial_number: string;

  @BelongsTo(() => GoodsReceiptDetail)
  goods_receipt_detail: GoodsReceiptDetail;
}
