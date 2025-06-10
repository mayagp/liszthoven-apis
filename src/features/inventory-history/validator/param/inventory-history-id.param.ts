import * as Joi from 'joi';
import { InventoryHistory } from '../../entities/inventory-history.entity';

export const inventoryHistoryIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const inventoryHistory = await InventoryHistory.findByPk(value);
    if (!inventoryHistory) {
      throw new Joi.ValidationError(
        'any.invalid-inventory-history-id',
        [
          {
            message: 'Inventory history not found',
            path: ['id'],
            type: 'any.invalid-inventory-history-id',
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
