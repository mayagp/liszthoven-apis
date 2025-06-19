import * as Joi from 'joi';
import { PurchaseReturnDetail } from '../../entities/purchase-return-detail.entity';

export const purchaseReturnDetailIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseReturn = await PurchaseReturnDetail.findByPk(value);
    if (!purchaseReturn) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-return-detail-id',
        [
          {
            message: 'Purchase return detail not found',
            path: ['id'],
            type: 'any.invalid-purchase-return-detail-id',
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
