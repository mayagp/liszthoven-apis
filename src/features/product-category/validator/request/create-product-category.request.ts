import * as Joi from 'joi';
import { ProductCategory } from '../../entities/product-category.entity';

export const createProductCategorySchema = Joi.object({
  name: Joi.string().required(),
  category_parent_id: Joi.number()
    .allow(null)
    .external(async (value) => {
      if (value) {
        const productCategory = await ProductCategory.findOne({
          where: { id: value },
        });
        if (!productCategory) {
          throw new Joi.ValidationError(
            'any.product_categories-not-found',
            [
              {
                message: 'Product category not found',
                path: ['category_parent_id'],
                type: 'any.category-parent-not-found',
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
      }

      return value;
    }),
}).options({ abortEarly: false });
