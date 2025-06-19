import * as Joi from 'joi';
import { PurchaseOrder } from '../../entities/purchase-order.entity';

export const purchaseOrderIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseOrder = await PurchaseOrder.findByPk(value);
    if (!purchaseOrder) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-order-id',
        [
          {
            message: 'Purchase order not found',
            path: ['id'],
            type: 'any.invalid-purchase-order-id',
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
