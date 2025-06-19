import * as Joi from 'joi';

export const updateGoodsReceiptSchema = Joi.object({
  date: Joi.date().required(),
  note: Joi.string().optional().default('').allow(null, ''),
}).options({ abortEarly: false });
