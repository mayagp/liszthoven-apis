import * as Joi from 'joi';
import { Province } from '../../entities/province.entity';

export const provinceIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const province = await Province.findByPk(value);
    if (!province) {
      throw new Joi.ValidationError(
        'any.invalid-province-id',
        [
          {
            message: 'Province not found',
            path: ['id'],
            type: 'any.invalid-province-id',
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
