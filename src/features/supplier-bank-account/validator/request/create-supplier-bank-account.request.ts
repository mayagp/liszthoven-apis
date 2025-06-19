import * as Joi from 'joi';

export const createSupplierBankAccountSchema = Joi.object({
  account_no: Joi.string().required(),
  bank: Joi.string().required(),
}).options({ abortEarly: false });
