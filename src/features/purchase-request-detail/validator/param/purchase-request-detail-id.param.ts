import * as Joi from 'joi';
import { PurchaseRequestDetail } from '../../entities/purchase-request-detail.entity';

export const purchaseRequestDetailIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseRequestDetail = await PurchaseRequestDetail.findByPk(value);
    if (!purchaseRequestDetail) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-request-detail-id',
        [
          {
            message: 'Purchase request detail not found',
            path: ['id'],
            type: 'any.invalid-purchase-request-detail-id',
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
