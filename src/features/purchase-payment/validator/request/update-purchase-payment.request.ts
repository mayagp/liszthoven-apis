import * as Joi from 'joi';

export const updatePurchasePaymentSchema = Joi.object({
  date: Joi.date().required(),
  payment_method: Joi.string().required(),
  note: Joi.string().optional().default('').allow(null, ''),
}).options({ abortEarly: false });
