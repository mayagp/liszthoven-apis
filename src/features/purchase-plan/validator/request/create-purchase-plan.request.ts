import * as Joi from 'joi';
import { Product } from 'src/features/product/entities/product.entity';
import { Warehouse } from 'src/features/warehouse/entities/warehouse.entity';

export const createPurchasePlanSchema = Joi.object({
  warehouse_id: Joi.number()
    .required()
    .external(async (value) => {
      const warehouse = await Warehouse.findByPk(+value);
      if (!warehouse) {
        throw new Joi.ValidationError(
          'any.warehouse_id',
          [
            {
              message: 'Warehouse not found',
              path: ['warehouse_id'],
              type: 'any.warehouse-not-found',
              context: {
                key: 'warehouse_id',
                label: 'warehouse_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
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
  quantity: Joi.number().required(),
  date: Joi.date().required(),
}).options({ abortEarly: false });
