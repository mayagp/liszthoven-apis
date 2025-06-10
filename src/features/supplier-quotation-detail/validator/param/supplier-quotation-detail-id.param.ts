import * as Joi from 'joi';
import { SupplierQuotationDetail } from '../../entities/supplier-quotation-detail.entity';

export const supplierQuotationDetailIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const supplierQuotationDetail =
      await SupplierQuotationDetail.findByPk(value);
    if (!supplierQuotationDetail) {
      throw new Joi.ValidationError(
        'any.invalid-supplier-quotation-detail-id',
        [
          {
            message: 'Supplier quotation detail not found',
            path: ['id'],
            type: 'any.invalid-supplier-quotation-detail-id',
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
