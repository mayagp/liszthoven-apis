import * as Joi from 'joi';

export const updatePlanImplementSchema = Joi.object({
  quantity: Joi.number().required(),
}).options({ abortEarly: false });
