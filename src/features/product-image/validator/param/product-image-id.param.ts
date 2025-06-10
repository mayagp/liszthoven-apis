import * as Joi from 'joi';
import { ProductImage } from '../../entities/product-image.entity';

export const productImageIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const product = await ProductImage.findByPk(value);
    if (!product) {
      throw new Joi.ValidationError(
        'any.invalid-product-image-id',
        [
          {
            message: 'Product image category not found',
            path: ['id'],
            type: 'any.invalid-product-image-id',
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
