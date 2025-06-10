import * as Joi from 'joi';

export const updateSupplierSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  contact_no: Joi.string().required(),
  pic: Joi.string().required(),
  tax_no: Joi.string().allow('', null),
}).options({ abortEarly: false });
