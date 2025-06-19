import * as Joi from 'joi';

export const updateSupplierSchema = Joi.object({
  user_id: Joi.number().required(),
  total_payable: Joi.number().allow('', null),
  tax_no: Joi.string().allow('', null),
  account_no: Joi.string().required(),
  bank: Joi.string().allow('', null),
  swift_code: Joi.string().allow('', null),
}).options({ abortEarly: false });
