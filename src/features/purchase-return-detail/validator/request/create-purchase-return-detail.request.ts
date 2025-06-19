import * as Joi from 'joi';

export const createPurchaseReturnDetailSchema = Joi.object({
  purchaseable_id: Joi.number().required(),
  quantity: Joi.number().required().min(1),
  amount: Joi.number().required(),
}).options({ abortEarly: false });
