import * as Joi from 'joi';
import { Province } from 'src/features/province/entities/province.entity';

export const createCitySchema = Joi.object({
  name: Joi.string().required(),
  postal_code: Joi.string().required(),
  province_id: Joi.number()
    .required()
    .external(async (value) => {
      const province = await Province.findOne({
        where: { id: value },
      });
      if (!province) {
        throw new Joi.ValidationError(
          'any.province_id',
          [
            {
              message: 'Province not found',
              path: ['province_id'],
              type: 'any.province-not-found',
              context: {
                key: 'province_id',
                label: 'province_id',
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
