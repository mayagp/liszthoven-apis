import * as Joi from 'joi';
import { PurchasePayment } from '../../entities/purchase-payment.entity';

export const purchasePaymentIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchasePayment = await PurchasePayment.findByPk(value);
    if (!purchasePayment) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-payment-id',
        [
          {
            message: 'Purchase payment not found',
            path: ['id'],
            type: 'any.invalid-purchase-payment-id',
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
