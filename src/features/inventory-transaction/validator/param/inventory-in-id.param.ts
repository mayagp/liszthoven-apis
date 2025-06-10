import * as Joi from 'joi';
import { InventoryInTransaction } from '../../entities/inventory-in-transaction.entity';

export const inventoryInTransactionIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const inventory = await InventoryInTransaction.findByPk(value);
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
