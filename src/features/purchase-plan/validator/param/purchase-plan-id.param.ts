import * as Joi from 'joi';
import { PurchasePlan } from '../../entities/purchase-plan.entity';

export const purchasePlanIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const purchasePlan = await PurchasePlan.findByPk(value);
    if (!purchasePlan) {
      throw new Joi.ValidationError(
        'any.invalid-purchase-plan-id',
        [
          {
            message: 'Purchase plan not found',
            path: ['id'],
            type: 'any.invalid-purchase-plan-id',
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
