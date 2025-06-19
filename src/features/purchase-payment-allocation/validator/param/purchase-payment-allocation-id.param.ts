import * as Joi from 'joi';
import { PurchasePaymentAllocation } from '../../entities/purchase-payment-allocation.entity';

export const purchasePaymentAllocationIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchasePayment = await PurchasePaymentAllocation.findByPk(value);
    if (!purchasePayment) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-payment-allocation-id',
        [
          {
            message: 'Purchase payment allocation not found',
            path: ['id'],
            type: 'any.invalid-purchase-payment-allocation-id',
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
