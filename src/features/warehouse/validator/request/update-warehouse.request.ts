import * as Joi from 'joi';

export const updateWarehouseSchema = Joi.object({
  code: Joi.string().required(),
  name: Joi.string().required(),
  location: Joi.string().required(),
}).options({ abortEarly: false });
