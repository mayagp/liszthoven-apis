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
}).options({ abortEarly: false });
