import * as Joi from 'joi';
import { Branch } from 'src/features/branch/entities/branch.entity';
import { Product } from 'src/features/product/entities/product.entity';
import { SupplierQuotation } from 'src/features/supplier-quotation/entities/supplier-quotation.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';

export const createPurchaseOrderSchema = Joi.object({
  supplier_id: Joi.number()
    .required()
    .external(async (value) => {
      const supplier = await Supplier.findOne({
        where: { id: value },
      });
      if (!supplier) {
        throw new Joi.ValidationError(
          'any.supplier_id',
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
  tax: Joi.number(),
  note: Joi.string().optional().default('').allow(null, ''),
  branch_id: Joi.number()
    .required()
    .external(async (value) => {
      const branch = await Branch.findOne({
        where: { id: value },
      });
      if (!branch) {
        throw new Joi.ValidationError(
          'any.branch_id',
          [
            {
              message: 'Branch not found',
              path: ['branch_id'],
              type: 'any.branch-not-found',
              context: {
                key: 'branch_id',
                label: 'branch_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  purchase_order_details: Joi.array()
    .items(
      Joi.object({
        quotation_no: Joi.string().allow(null),
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
        quantity_ordered: Joi.number().required().min(1),
      }),
    )
    .unique('product_id'),
}).options({ abortEarly: false });
