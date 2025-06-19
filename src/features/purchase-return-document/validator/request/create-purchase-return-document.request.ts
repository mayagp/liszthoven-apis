import * as Joi from 'joi';

export const createPurchaseReturnDocumentSchema = Joi.object({
  purchase_return_documents: Joi.array()
    .items(
      Joi.object({
        original_name: Joi.string().required().allow(''),
      }),
    )
    .required()
    .min(1),
}).options({ abortEarly: false });
