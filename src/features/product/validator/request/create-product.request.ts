import * as Joi from 'joi';
import { ProductCategory } from 'src/features/product-category/entities/product-category.entity';

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(null, ''),
  type: Joi.number().required(),
  base_price: Joi.number().required().min(1),
  uom: Joi.string().allow(null, ''),
  minimal_stock_level: Joi.number().allow(null, ''),
  status: Joi.number().required(),
  valuation_method: Joi.number().required(),
  brand: Joi.string().required(),
  quantity: Joi.number().required(),
  product_category_id: Joi.number()
    .required()
    .external(async (value) => {
      const productCategory = await ProductCategory.findOne({
        where: { id: value },
      });
      if (!productCategory) {
        throw new Joi.ValidationError(
          'any.product-category-not-found',
          [
            {
              message: 'Product category not found',
              path: ['product_category_id'],
              type: 'any.product-category-not-found',
              context: {
                key: 'product_category_id',
                label: 'product_category_id',
                value,
              },
            },
          ],
          value,
        );
      }

      return value;
    }),
  product_images: Joi.array().items(
    Joi.object({
      is_default: Joi.boolean().required(),
      file: Joi.any(),
    }),
  ),
}).options({ abortEarly: false });
