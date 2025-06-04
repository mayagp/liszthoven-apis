import * as Joi from 'joi';
import { City } from 'src/features/city/entities/city.entity';
import { Province } from 'src/features/province/entities/province.entity';
import { Subdistrict } from 'src/features/subdistrict/entities/subdistrict.entity';

export const createBranchSchema = Joi.object({
  name: Joi.string().optional().allow(null, ''),
  address: Joi.string().required(),
  note: Joi.string().optional().default('').allow(null, ''),
  email: Joi.string().optional().allow(null, ''),
  phone: Joi.string().optional().allow(null, ''),
  electric_bill_no: Joi.string().optional().allow(null, ''),
  water_bill_no: Joi.string().optional().allow(null, ''),
  internet_bill_no: Joi.string().optional().allow(null, ''),
  province_id: Joi.number()
    .optional()
    .external(async (value) => {
      const province = await Province.findOne({ where: { id: value } });
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
    }),
  city_id: Joi.number()
    .optional()
    .external(async (value) => {
      const city = await City.findOne({ where: { id: value } });
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
    }),
  subdistrict_id: Joi.number()
    .optional()
    .external(async (value) => {
      const subdistrict = await Subdistrict.findOne({ where: { id: value } });
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
    }),
}).options({ abortEarly: false });
