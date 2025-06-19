import * as Joi from 'joi';
import { Branch } from 'src/features/branch/entities/branch.entity';
import { Product } from 'src/features/product/entities/product.entity';

export const createPurchaseRequestSchema = Joi.object({
  date: Joi.date().required(),
  branch_id: Joi.number()
    .required()
    .external(async (value) => {
      const branch = await Branch.findOne({
        where: { id: value },
      });
      if (!branch) {
        throw new Joi.ValidationError(
          'any.branch_id',
          [
            {
              message: 'Branch not found',
              path: ['branch_id'],
              type: 'any.branch-not-found',
              context: {
                key: 'branch_id',
                label: 'branch_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  purchase_request_details: Joi.array().items(
    Joi.object({
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
    }),
  ),
}).options({ abortEarly: false });
