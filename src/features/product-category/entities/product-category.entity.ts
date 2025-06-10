import {
  BelongsTo,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: true,
  tableName: 'product_categories',
  modelName: 'product_categories',
})
export class ProductCategory extends Model {
  @Column(DataType.STRING)
  name: string;

  @Column(DataType.STRING)
  category_parent_id: string;

  @BelongsTo(() => ProductCategory, {
    foreignKey: 'category_parent_id',
    as: 'top_category',
  })
  top_category: ProductCategory;

  @HasMany(() => ProductCategory, {
    sourceKey: 'id',
    foreignKey: 'category_parent_id',
    as: 'leaf_categories',
  })
  leaf_categories: ProductCategory[];
}
