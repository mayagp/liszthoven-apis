import * as Joi from 'joi';

export const updatePurchaseReturnSchema = Joi.object({
  date: Joi.date().required(),
  note: Joi.string().optional().default('').allow(null, ''),
}).options({ abortEarly: false });
