import * as Joi from 'joi';
import { PurchaseInvoice } from '../../entities/purchase-invoice.entity';

export const purchaseInvoiceIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseInvoice = await PurchaseInvoice.findByPk(value);
    if (!purchaseInvoice) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-invoice-id',
        [
          {
            message: 'Purchase invoice not found',
            path: ['id'],
            type: 'any.invalid-purchase-invoice-id',
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
