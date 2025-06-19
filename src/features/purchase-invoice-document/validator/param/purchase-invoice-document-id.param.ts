import * as Joi from 'joi';
import { PurchaseInvoiceDocument } from '../../entities/purchase-invoice-document.entity';

export const purchaseInvoiceDocumentIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseInvoiceDocument =
      await PurchaseInvoiceDocument.findByPk(value);
    if (!purchaseInvoiceDocument) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-invoice-document-id',
        [
          {
            message: 'Purchase invoice document not found',
            path: ['id'],
            type: 'any.invalid-purchase-invoice-document-id',
            context: {
              key: 'id',
              label: 'id',
              value,
            },
          },
        ],
        value,
      );
    }
  });
