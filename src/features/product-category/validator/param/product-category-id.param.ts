import * as Joi from 'joi';
import { ProductCategory } from '../../entities/product-category.entity';

export const productCategoryIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const productCategory = await ProductCategory.findByPk(value);
    if (!productCategory) {
      throw new Joi.ValidationError(
        'any.invalid-product-category-id',
        [
          {
            message: 'Product category not found',
            path: ['id'],
            type: 'any.invalid-product-category-id',
            context: {
              key: 'id',
              label: 'id',
              value,
            },
          },
        ],
        value,
      );
    }
  });
