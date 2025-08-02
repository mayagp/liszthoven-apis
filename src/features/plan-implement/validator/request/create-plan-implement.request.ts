import * as Joi from 'joi';
import { PurchaseInvoiceDetail } from 'src/features/purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import { PurchaseOrderDetail } from 'src/features/purchase-order-detail/entities/purchase-order-detail.entity';

export const createPlanImplementSchema = Joi.object({
  planable_type: Joi.string().valid(
    'purchase_order_details',
    'purchase_invoice_details',
  ),
  planable_id: Joi.number()
    .required()
    .when('planable_type', {
      is: 'purchase_invoice_details',
      then: Joi.number().external(async (value) => {
        const purchaseInvoiceDetail = await PurchaseInvoiceDetail.findOne({
          where: { id: value },
          include: [{ association: 'purchase_invoice' }],
        });
        if (!purchaseInvoiceDetail) {
          throw new Joi.ValidationError(
            'any.planable_id',
            [
              {
                message: 'Invoice detail not found',
                path: ['planable_id'],
                type: 'any.invoice-detail-not-found',
                context: {
                  key: 'planable_id',
                  label: 'planable_id',
                  value,
                },
              },
            ],
            value,
          );
        }

        if (purchaseInvoiceDetail.purchase_invoice.purchase_order_id !== null) {
          throw new Joi.ValidationError(
            'any.planable_id',
            [
              {
                message:
                  'This invoice reference to order #' +
                  purchaseInvoiceDetail.purchase_invoice.purchase_order_id,
                path: ['planable_id'],
                type: 'any.invoice-detail-linked-to-order',
                context: {
                  key: 'planable_id',
                  label: 'planable_id',
                  value,
                },
              },
            ],
            value,
          );
        }

        return value;
      }),
    })
    .when('planable_type', {
      is: 'purchase_order_details',
      then: Joi.number().external(async (value) => {
        const purchaseOrderDetail = await PurchaseOrderDetail.findOne({
          where: { id: value },
        });
        if (!purchaseOrderDetail) {
          throw new Joi.ValidationError(
            'any.planable_id',
            [
              {
                message: 'Order detail not found',
                path: ['planable_id'],
                type: 'any.order-detail-not-found',
                context: {
                  key: 'planable_id',
                  label: 'planable_id',
                  value,
                },
              },
            ],
            value,
          );
        }

        return value;
      }),
    }),
  quantity: Joi.number().required(),
  date: Joi.date().required(),
}).options({ abortEarly: false });
