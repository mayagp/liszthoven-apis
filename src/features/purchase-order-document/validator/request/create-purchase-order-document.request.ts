import * as Joi from 'joi';

export const createPurchaseOrderDocumentSchema = Joi.object({
  purchase_order_documents: Joi.array()
    .items(
      Joi.object({
        original_name: Joi.string().required().allow(''),
      }),
    )
    .required()
    .min(1),
}).options({ abortEarly: false });
