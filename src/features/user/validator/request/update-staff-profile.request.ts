import * as Joi from 'joi';

export const updateStaffProfileSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().allow('', null),
  phone_no: Joi.string().allow('', null),
  staff: Joi.object({
    identification_number: Joi.string().allow('', null),
    tax_number: Joi.string().allow('', null),
    bpjs_number: Joi.string().allow('', null),
    working_since: Joi.date().allow('', null),
    note: Joi.string().optional().default('').allow(null, ''),
  }),
  supplier: Joi.object({
    tax_no: Joi.string().allow('', null),
    total_payable: Joi.number().allow('', null),
    account_no: Joi.string().allow('', null),
    bank: Joi.string().allow('', null),
    swift_code: Joi.string().allow('', null),
  }),
}).options({ abortEarly: false });
