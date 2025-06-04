import * as Joi from 'joi';
import { Subdistrict } from '../../entities/subdistrict.entity';

export const subdistrictIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const subdistrict = await Subdistrict.findByPk(value);
    if (!subdistrict) {
      throw new Joi.ValidationError(
        'any.invalid-subdistrict-id',
        [
          {
            message: 'Subdistrict not found',
            path: ['id'],
            type: 'any.invalid-subdistrict-id',
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
