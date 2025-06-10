import * as Joi from 'joi';
import { Product } from '../../entities/product.entity';

export const productIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const product = await Product.findByPk(value);
    if (!product) {
      throw new Joi.ValidationError(
        'any.invalid-product-id',
        [
          {
            message: 'Product category not found',
            path: ['id'],
            type: 'any.invalid-product-id',
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
