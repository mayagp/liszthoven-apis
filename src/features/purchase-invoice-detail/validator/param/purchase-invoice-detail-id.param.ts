import * as Joi from 'joi';
import { PurchaseInvoiceDetail } from '../../entities/purchase-invoice-detail.entity';

export const purchaseInvoiceDetailIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseInvoiceDetail = await PurchaseInvoiceDetail.findByPk(value);
    if (!purchaseInvoiceDetail) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-invoice-detail-id',
        [
          {
            message: 'Purchase invoice not found',
            path: ['id'],
            type: 'any.invalid-purchase-invoice-detail-id',
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
