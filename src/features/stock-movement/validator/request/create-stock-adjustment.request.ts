import * as Joi from 'joi';
import { Warehouse } from 'src/features/warehouse/entities/warehouse.entity';

export const warehouseValidation = Joi.number()
  .required()
  .external(async (value) => {
    const warehouse = await Warehouse.findOne({
      where: { id: value },
    });
    if (!warehouse) {
      throw new Joi.ValidationError(
        'any.warehouse-not-found',
        [
          {
            message: 'Warehouse not found',
            path: ['code'],
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
  });

export const createStockMovementSchema = Joi.object({
  product_id: Joi.number().required(),
  quantity: Joi.number().required().min(1),
  date: Joi.date().required(),
  from_id: warehouseValidation,
  to_id: warehouseValidation.disallow(Joi.ref('from_id')),
  note: Joi.string().optional().default('').allow(null, ''),
  type: Joi.number().required(),
}).options({ abortEarly: false });
