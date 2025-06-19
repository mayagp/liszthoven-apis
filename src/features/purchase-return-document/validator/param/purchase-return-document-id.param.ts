import * as Joi from 'joi';
import { PurchaseReturnDocument } from '../../entities/purchase-return-document.entity';

export const purchaseReturnDocumentIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseReturnDocument = await PurchaseReturnDocument.findByPk(value);
    if (!purchaseReturnDocument) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-return-document-id',
        [
          {
            message: 'Purchase return document not found',
            path: ['id'],
            type: 'any.invalid-purchase-return-document-id',
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
