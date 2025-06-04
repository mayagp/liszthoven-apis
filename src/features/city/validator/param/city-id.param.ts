import * as Joi from 'joi';
import { City } from '../../entities/city.entity';

export const cityIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const city = await City.findByPk(value);
    if (!city) {
      throw new Joi.ValidationError(
        'any.invalid-city-id',
        [
          {
            message: 'City not found',
            path: ['id'],
            type: 'any.invalid-city-id',
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
