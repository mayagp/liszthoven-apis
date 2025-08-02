import * as Joi from 'joi';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';

const updateSupplierQuotationDetailSchema = Joi.object({
  id: Joi.number().optional(),
  product: Joi.any().optional(),
  quantity: Joi.number().optional(),
  price_per_unit: Joi.number().optional(),
});

export const updateSupplierQuotationSchema = Joi.object({
  // quotation_no: Joi.string().required(),
  supplier_id: Joi.number()
    .required()
    .external(async (value) => {
      const supplier = await Supplier.findOne({ where: { id: value } });
      if (!supplier) {
        throw new Joi.ValidationError(
          'any.supplier-not-found',
          [
            {
              message: 'Supplier not found',
              path: ['supplier_id'],
              type: 'any.supplier-not-found',
              context: {
                key: 'supplier_id',
                label: 'supplier_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  date: Joi.date().required(),
  expected_delivery_date: Joi.date().required(),
  tax: Joi.number().required(),
  note: Joi.string().optional().default('').allow(null, ''),
  supplier_quotation_details: Joi.array()
    .items(updateSupplierQuotationDetailSchema)
    .optional(),
}).options({ abortEarly: false });
