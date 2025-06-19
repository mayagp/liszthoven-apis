import * as Joi from 'joi';

export const updatePurchasePaymentDocumentSchema = Joi.object({
  original_name: Joi.string().required().allow(''),
}).options({ abortEarly: false });
