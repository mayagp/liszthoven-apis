import * as Joi from 'joi';
import { Product } from 'src/features/product/entities/product.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';
import { SupplierQuotation } from '../../entities/supplier-quotation.entity';

export const createSupplierQuotationSchema = Joi.object({
  quotation_no: Joi.string()
    .required()
    .external(async (value) => {
      const supplierQuotation = await SupplierQuotation.findOne({
        where: { quotation_no: value },
      });
      if (supplierQuotation) {
        throw new Joi.ValidationError(
          'any.quotation-no-exists',
          [
            {
              message: 'Quotation no already exists',
              path: ['quotation_no'],
              type: 'any.quotation-no-exists',
              context: {
                key: 'quotation_no',
                label: 'quotation_no',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
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
  supplier_quotation_details: Joi.array().items(
    Joi.object({
      product_id: Joi.number()
        .required()
        .external(async (value) => {
          const product = await Product.findOne({
            where: { id: value },
          });
          if (!product) {
            throw new Joi.ValidationError(
              'any.product_id',
              [
                {
                  message: 'Product not found',
                  path: ['product_id'],
                  type: 'any.product-not-found',
                  context: {
                    key: 'product_id',
                    label: 'product_id',
                    value,
                  },
                },
              ],
              value,
            );
          }
          return value;
        }),
      quantity: Joi.number().required(),
      price_per_unit: Joi.number().required(),
    }),
  ),
}).options({ abortEarly: false });
