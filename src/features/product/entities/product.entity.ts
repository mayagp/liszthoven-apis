import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { getProductTypeEnumLabel } from '../enum/product-type.enum';
import { ProductCategory } from 'src/features/product-category/entities/product-category.entity';
import { ProductImage } from 'src/features/product-image/entities/product-image.entity';
import { getProductStatusEnumLabel } from '../enum/product-status.enum';
import { getValuationMethodEnumLabel } from '../enum/valuation-method.enum';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'products',
  modelName: 'products',
})
export class Product extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Column(DataType.TINYINT)
  type: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Product) {
      return getProductTypeEnumLabel(+this.getDataValue('type'));
    },
  })
  type_name: string;

  @Column(DataType.DECIMAL(16, 2))
  base_price: number;

  @Column({ type: DataType.TINYINT, defaultValue: 0 })
  status: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Product) {
      return getProductStatusEnumLabel(+this.getDataValue('status'));
    },
  })
  status_name: string;

  @Column(DataType.TINYINT)
  valuation_method: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Product) {
      return getValuationMethodEnumLabel(
        +this.getDataValue('valuation_method'),
      );
    },
  })
  valuation_method_name: string;

  @ForeignKey(() => ProductCategory)
  @Column(DataType.BIGINT)
  product_category_id: number;

  //   @ForeignKey(() => Brand)
  //   @Column(DataType.BIGINT)
  //   brand_id: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  quantity: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  uom: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  brand: string;

  @BelongsTo(() => ProductCategory)
  product_category: ProductCategory;

  //   @BelongsTo(() => Brand)
  //   brand: Brand;

  @HasMany(() => ProductImage)
  product_images: ProductImage[];
}
