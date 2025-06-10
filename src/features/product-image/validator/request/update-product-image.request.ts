import * as Joi from 'joi';

export const updateProductImageSchema = Joi.object({
  product_images: Joi.array().items(
    Joi.object({
      id: Joi.number().required(),
      sequence: Joi.number().required(),
      is_default: Joi.boolean().required(),
    }),
  ),
}).options({ abortEarly: false });
