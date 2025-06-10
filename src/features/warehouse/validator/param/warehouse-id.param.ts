import * as Joi from 'joi';
import { Warehouse } from '../../entities/warehouse.entity';

export const warehouseIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const warehouse = await Warehouse.findByPk(value);
    if (!warehouse) {
      throw new Joi.ValidationError(
        'any.invalid-warehouse-id',
        [
          {
            message: 'warehouse not found',
            path: ['id'],
            type: 'any.invalid-warehouse-id',
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
