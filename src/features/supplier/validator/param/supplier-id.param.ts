import * as Joi from 'joi';
import { Supplier } from '../../entities/supplier.entity';

export const supplierIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const supplier = await Supplier.findByPk(value);
    if (!supplier) {
      throw new Joi.ValidationError(
        'any.invalid-supplier-id',
        [
          {
            message: 'supplier not found',
            path: ['id'],
            type: 'any.invalid-supplier-id',
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
