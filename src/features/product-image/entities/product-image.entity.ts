import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from 'src/features/product/entities/product.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'product_images',
  modelName: 'product_images',
})
export class ProductImage extends Model {
  @Column(DataType.STRING)
  url: string;

  @Column(DataType.TEXT)
  file_path: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_default: boolean;

  @Column(DataType.STRING)
  file_type: string;

  @Column(DataType.INTEGER)
  sequence: number;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @BelongsTo(() => Product)
  product: Product;
}
