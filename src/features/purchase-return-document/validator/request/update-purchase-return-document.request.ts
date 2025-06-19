import * as Joi from 'joi';

export const updatePurchaseReturnDocumentSchema = Joi.object({
  original_name: Joi.string().required().allow(''),
}).options({ abortEarly: false });
