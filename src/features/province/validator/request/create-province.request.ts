import * as Joi from 'joi';

export const createProvinceSchema = Joi.object({
  name: Joi.string().required(),
}).options({ abortEarly: false });
