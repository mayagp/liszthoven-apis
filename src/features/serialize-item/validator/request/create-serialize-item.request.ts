import * as Joi from 'joi';
import { Inventory } from 'src/features/inventory/entities/inventory.entity';
import { Product } from 'src/features/product/entities/product.entity';

export const createSerializeItemSchema = Joi.object({
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
  inventory_id: Joi.number()
    .required()
    .external(async (value) => {
      const inventory = await Inventory.findOne({
        where: { id: value },
      });
      if (!inventory) {
        throw new Joi.ValidationError(
          'any.inventory_id',
          [
            {
              message: 'Inventory not found',
              path: ['inventory_id'],
              type: 'any.inventory-not-found',
              context: {
                key: 'inventory_id',
                label: 'inventory_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  warranty_end_date: Joi.date().required(),
  is_sold: Joi.boolean().required(),
  serial_code: Joi.string()
    .required()
    .external(async (value) => {
      const inventory = await Inventory.findOne({
        where: { serial_code: value },
      });
      if (inventory) {
        throw new Joi.ValidationError(
          'any.serial_code',
          [
            {
              message: 'Serial code already taken',
              path: ['serial_code'],
              type: 'any.serial-code-already-taken',
              context: {
                key: 'serial_code',
                label: 'serial_code',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
}).options({ abortEarly: false });
