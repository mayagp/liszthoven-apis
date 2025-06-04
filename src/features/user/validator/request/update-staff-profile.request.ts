import * as Joi from 'joi';
import GenderEnum from 'src/features/staff/enums/gender.enum';
import ReligionEnum from 'src/features/staff/enums/religion.enum';

export const updateStaffProfileSchema = Joi.object({
  name: Joi.string().required(),
  gender: Joi.number().valid(
    GenderEnum.MALE,
    GenderEnum.FEMALE,
    GenderEnum.OTHER,
  ),
  address: Joi.string().allow('', null),
  phone_no: Joi.string().allow('', null),
  birth_date: Joi.date().allow('', null),
  staff: Joi.object({
    identification_number: Joi.string().allow('', null),
    tax_number: Joi.string().allow('', null),
    bpjs_number: Joi.string().allow('', null),
    working_since: Joi.date().allow('', null),
    religion: Joi.number().valid(
      ReligionEnum.BUDDHISM,
      ReligionEnum.CATHOLIC,
      ReligionEnum.HINDUISM,
      ReligionEnum.ISLAM,
      ReligionEnum.CHRISTIANITY,
      ReligionEnum.OTHER,
    ),
    basic_salary: Joi.number().allow('', null),
    note: Joi.string().optional().default('').allow(null, ''),
  }),
}).options({ abortEarly: false });
