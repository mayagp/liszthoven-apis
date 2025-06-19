import * as Joi from 'joi';
import { PurchaseReturn } from '../../entities/purchase-return.entity';

export const purchaseReturnIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchaseReturn = await PurchaseReturn.findByPk(value);
    if (!purchaseReturn) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-return-id',
        [
          {
            message: 'Purchase return not found',
            path: ['id'],
            type: 'any.invalid-purchase-return-id',
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
