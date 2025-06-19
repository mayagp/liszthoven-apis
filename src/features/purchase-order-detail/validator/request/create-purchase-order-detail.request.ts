import * as Joi from 'joi';
import { Product } from 'src/features/product/entities/product.entity';
import { SupplierQuotation } from 'src/features/supplier-quotation/entities/supplier-quotation.entity';

export const createPurchaseOrderDetailSchema = Joi.object({
  quotation_no: Joi.string().required(),
  supplier_quotation_id: Joi.number()
    .allow(null)
    .external(async (value) => {
      if (value) {
        const supplierQuotation = await SupplierQuotation.findOne({
          where: { id: value },
        });
        if (!supplierQuotation) {
          throw new Joi.ValidationError(
            'any.supplier_quotation_id',
            [
              {
                message: 'Supplier quotation not found',
                path: ['supplier_quotation_id'],
                type: 'any.supplier-quotation-not-found',
                context: {
                  key: 'supplier_quotation_id',
                  label: 'supplier_quotation_id',
                  value,
                },
              },
            ],
            value,
          );
        }
      }
      return value;
    }),
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
  price_per_unit: Joi.number().required(),
  expected_delivery_date: Joi.date().allow(null),
  quantity_ordered: Joi.number().min(1).required(),
}).options({ abortEarly: false });
