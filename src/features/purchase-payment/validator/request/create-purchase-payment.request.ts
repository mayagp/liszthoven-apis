import * as Joi from 'joi';
import { PurchaseInvoice } from 'src/features/purchase-invoice/entities/purchase-invoice.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';

export const createPurchasePaymentSchema = Joi.object({
  supplier_id: Joi.number()
    .required()
    .external(async (value) => {
      const supplier = await Supplier.findOne({
        where: { id: value },
      });
      if (!supplier) {
        throw new Joi.ValidationError(
          'any.supplier_id',
          [
            {
              message: 'supplier not found',
              path: ['supplier_id'],
              type: 'any.supplier-not-found',
              context: {
                key: 'supplier_id',
                label: 'supplier_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  date: Joi.date().required(),
  payment_method: Joi.string().required(),
  note: Joi.string().optional().default('').allow(null, ''),
  purchase_payment_allocations: Joi.array().items(
    Joi.object({
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
    }),
  ),
}).options({ abortEarly: false });
