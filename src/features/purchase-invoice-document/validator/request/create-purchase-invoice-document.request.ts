import * as Joi from 'joi';

export const createPurchaseInvoiceDocumentSchema = Joi.object({
  purchase_invoice_documents: Joi.array()
    .items(
      Joi.object({
        original_name: Joi.string().required().allow(''),
      }),
    )
    .required()
    .min(1),
}).options({ abortEarly: false });
