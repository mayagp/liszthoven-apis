import * as Joi from 'joi';
import { AutoNumber } from '../../entities/auto-number.entity';

export const autoNumberIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const autoNumber = await AutoNumber.findByPk(value);
    if (!autoNumber) {
      throw new Joi.ValidationError(
        'any.invalid-auto-number-id',
        [
          {
            message: 'Auto number not found',
            path: ['id'],
            type: 'any.invalid-auto-number-id',
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
