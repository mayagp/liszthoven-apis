import * as Joi from 'joi';
import { SupplierQuotation } from '../../entities/supplier-quotation.entity';

export const supplierQuotationIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const supplierQuotation = await SupplierQuotation.findByPk(value);
    if (!supplierQuotation) {
      throw new Joi.ValidationError(
        'any.invalid-supplier-quotation-id',
        [
          {
            message: 'Supplier quotation not found',
            path: ['id'],
            type: 'any.invalid-supplier-quotation-id',
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
