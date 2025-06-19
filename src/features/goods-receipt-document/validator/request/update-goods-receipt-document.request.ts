import * as Joi from 'joi';

export const updateGoodsReceiptDocumentSchema = Joi.object({
  original_name: Joi.string().required().allow(''),
}).options({ abortEarly: false });
