import * as Joi from 'joi';
import { PurchaseOrderDocument } from '../../entities/purchase-order-document.entity';

export const purchaseOrderDocumentIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseOrderDocument = await PurchaseOrderDocument.findByPk(value);
    if (!purchaseOrderDocument) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-order-document-id',
        [
          {
            message: 'Purchase order document not found',
            path: ['id'],
            type: 'any.invalid-purchase-order-document-id',
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
