import * as Joi from 'joi';
import { StockMovement } from '../../entities/stock-movement.entity';

export const stockMovementIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const stockMovement = await StockMovement.findByPk(value);
    if (!stockMovement) {
      throw new Joi.ValidationError(
        'any.invalid-stock-movement-id',
        [
          {
            message: 'Stock movement not found',
            path: ['id'],
            type: 'any.invalid-stock-movement-id',
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
