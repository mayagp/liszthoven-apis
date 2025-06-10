import * as Joi from 'joi';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';
import { SupplierService } from 'src/features/supplier/supplier.service';

export const updateSupplierQuotationSchema = Joi.object({
  quotation_no: Joi.string().required(),
  supplier_id: Joi.number()
    .required()
    .external(async (value) => {
      const supplier = await Supplier.findOne({
        where: { id: value },
      });
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
}).options({ abortEarly: false });
