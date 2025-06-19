import * as Joi from 'joi';
import { Product } from 'src/features/product/entities/product.entity';

export const createGoodsReceiptDetailSchema = Joi.object({
  product_id: Joi.number()
    .required()
    .external(async (value) => {
      const product = await Product.findOne({
        where: { id: value },
      });
      if (!product) {
        throw new Joi.ValidationError(
          'any.product_id',
          [
            {
              message: 'Product not found',
              path: ['product_id'],
              type: 'any.product-not-found',
              context: {
                key: 'product_id',
                label: 'product_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  quantity: Joi.number().required().min(1),
  gr_serial_numbers: Joi.array()
    .optional()
    .items(
      Joi.object({
        serial_number: Joi.string(),
      }),
    ),
}).options({ abortEarly: false });
