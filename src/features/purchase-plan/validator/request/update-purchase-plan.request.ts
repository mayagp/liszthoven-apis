import * as Joi from 'joi';
import PurchasePlanStatus from '../../enum/purchase-plan-status.enum';

export const updatePurchasePlanSchema = Joi.object({
  quantity: Joi.number().required(),
  date: Joi.date().required(),
  status: Joi.number()
    .required()
    .valid(
      PurchasePlanStatus.CREATED,
      PurchasePlanStatus.PROGRESS,
      PurchasePlanStatus.COMPLETED,
      PurchasePlanStatus.CANCELLED,
    ),
}).options({ abortEarly: false });
