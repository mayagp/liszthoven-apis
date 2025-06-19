import * as Joi from 'joi';
import { AutoNumber } from '../../entities/auto-number.entity';

export const createAutoNumberSchema = Joi.object({
  format: Joi.array().items(
    Joi.object({
      type: Joi.string().required().valid('string', 'autonumber', 'date'),
      value: Joi.required()
        .when('type', {
          is: 'autonumber',
          then: Joi.string()
            .max(10)
            .pattern(/^[0-9]+$/),
        })
        .when('type', { is: 'date', then: Joi.string().pattern(/[Ymd]/) })
        .when('type', { is: 'string', then: Joi.string().max(20) }),
    }),
  ),
  table: Joi.string()
    .required()
    .external(async (value) => {
      const autoNumber = await AutoNumber.findOne({
        where: { table: value },
      });
      if (autoNumber) {
        throw new Joi.ValidationError(
          'any.config-already-exists',
          [
            {
              message: 'Config for this table is already exists',
              path: ['table'],
              type: 'any.config-already-exists',
              context: {
                key: 'table',
                label: 'table',
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
