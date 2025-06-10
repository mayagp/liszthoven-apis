import * as Joi from 'joi';

export const createSupplierSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  contact_no: Joi.string().required(),
  pic: Joi.string().required(),
  tax_no: Joi.string().allow('', null),
  supplier_bank_accounts: Joi.array()
    .items(
      Joi.object({
        account_no: Joi.string().required(),
        bank: Joi.string().required(),
        swift_code: Joi.string().required().allow(''),
      }),
    )
    .empty(),
}).options({ abortEarly: false });
