import * as Joi from 'joi';

export const createProductImageSchema = Joi.object({
  product_images: Joi.array().items(
    Joi.object({
      is_default: Joi.boolean().required(),
      file: Joi.any(),
    }),
  ),
}).options({ abortEarly: false });
