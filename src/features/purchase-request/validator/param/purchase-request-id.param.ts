import * as Joi from 'joi';
import { PurchaseRequest } from '../../entities/purchase-request.entity';

export const purchaseRequestIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseRequest = await PurchaseRequest.findByPk(value);
    if (!purchaseRequest) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-request-id',
        [
          {
            message: 'Purchase request not found',
            path: ['id'],
            type: 'any.invalid-purchase-request-id',
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
