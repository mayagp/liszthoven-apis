import * as Joi from 'joi';
import { SupplierBankAccount } from '../../entities/supplier-bank-account.entity';

export const supplierBankAccountIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const supplier = await SupplierBankAccount.findByPk(value);
    if (!supplier) {
      throw new Joi.ValidationError(
        'any.invalid-supplier-bank-account-id',
        [
          {
            message: 'Supplier bank account not found',
            path: ['id'],
            type: 'any.invalid-supplier-bank-account-id',
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
