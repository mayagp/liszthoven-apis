import * as Joi from 'joi';
import { Inventory } from '../../entities/inventory.entity';

export const inventoryIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const inventory = await Inventory.findByPk(value);
    if (!inventory) {
      throw new Joi.ValidationError(
        'any.invalid-inventory-id',
        [
          {
            message: 'Inventory not found',
            path: ['id'],
            type: 'any.invalid-inventory-id',
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
