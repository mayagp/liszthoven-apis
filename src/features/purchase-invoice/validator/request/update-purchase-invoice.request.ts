import * as Joi from 'joi';

export const updatePurchaseInvoiceSchema = Joi.object({
  date: Joi.date().required(),
  due_date: Joi.date().required(),
  tax: Joi.number().required(),
  shipping_cost: Joi.number().allow(null, ''),
  note: Joi.string().optional().default('').allow(null, ''),
}).options({ abortEarly: false });
