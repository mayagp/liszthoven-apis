import * as Joi from 'joi';
import { PurchaseOrderDetail } from '../../entities/purchase-order-detail.entity';

export const purchaseOrderDetailIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseOrder = await PurchaseOrderDetail.findByPk(value);
    if (!purchaseOrder) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-order-detail-id',
        [
          {
            message: 'Purchase order detail not found',
            path: ['id'],
            type: 'any.invalid-purchase-order-detail-id',
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
