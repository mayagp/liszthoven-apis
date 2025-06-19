import * as Joi from 'joi';
import { PurchasePaymentDocument } from '../../entities/purchase-payment-document.entity';

export const purchasePaymentDocumentIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchasePaymentDocument =
      await PurchasePaymentDocument.findByPk(value);
    if (!purchasePaymentDocument) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-payment-document-id',
        [
          {
            message: 'Purchase payment document not found',
            path: ['id'],
            type: 'any.invalid-purchase-payment-document-id',
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
