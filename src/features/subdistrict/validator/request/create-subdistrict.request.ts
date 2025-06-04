import * as Joi from 'joi';
import { City } from 'src/features/city/entities/city.entity';

export const createSubdistrictSchema = Joi.object({
  name: Joi.string().required(),
  city_id: Joi.number()
    .required()
    .external(async (value) => {
      const city = await City.findOne({
        where: { id: value },
      });
      if (!city) {
        throw new Joi.ValidationError(
          'any.city_id',
          [
            {
              message: 'City not found',
              path: ['city_id'],
              type: 'any.city-not-found',
              context: {
                key: 'city_id',
                label: 'city_id',
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
