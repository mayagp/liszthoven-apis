import * as Joi from 'joi';

export const createSupplierBankAccountSchema = Joi.object({
  account_no: Joi.string().required(),
  bank: Joi.string().required(),
  swift_code: Joi.string().required().allow(''),
}).options({ abortEarly: false });
