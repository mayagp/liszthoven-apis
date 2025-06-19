import * as Joi from 'joi';
import { PurchaseInvoice } from 'src/features/purchase-invoice/entities/purchase-invoice.entity';

export const createPurchasePaymentAllocationSchema = Joi.object({
  purchase_invoice_id: Joi.number()
    .required()
    .external(async (value) => {
      const purchaseInvoice = await PurchaseInvoice.findOne({
        where: { id: value },
      });
      if (!purchaseInvoice) {
        throw new Joi.ValidationError(
          'any.purchase_invoice_id',
          [
            {
              message: 'Purchase invoice not found',
              path: ['purchase_invoice_id'],
              type: 'any.purchase-invoice-not-found',
              context: {
                key: 'purchase_invoice_id',
                label: 'purchase_invoice_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  amount_allocated: Joi.number().required().min(1),
}).options({ abortEarly: false });
