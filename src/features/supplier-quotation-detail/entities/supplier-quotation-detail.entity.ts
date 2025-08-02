import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from 'src/features/product/entities/product.entity';
import { SupplierQuotation } from 'src/features/supplier-quotation/entities/supplier-quotation.entity';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'supplier_quotation_details',
  modelName: 'supplier_quotation_details',
})
export class SupplierQuotationDetail extends Model {
  @ForeignKey(() => SupplierQuotation)
  @Column(DataType.BIGINT)
  supplier_quotation_id: number;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  product_id: number;

  @Column(DataType.INTEGER)
  quantity: number;

  @Column({ type: DataType.DECIMAL(12, 2), defaultValue: 0, allowNull: true })
  price_per_unit: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  total: number;

  @BelongsTo(() => SupplierQuotation)
  supplier_quotation: SupplierQuotation;

  @BelongsTo(() => Product)
  product: Product;
}
