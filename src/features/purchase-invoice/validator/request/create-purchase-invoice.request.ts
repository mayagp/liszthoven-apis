import * as Joi from 'joi';
import { Branch } from 'src/features/branch/entities/branch.entity';
import { Product } from 'src/features/product/entities/product.entity';
import { PurchaseOrder } from 'src/features/purchase-order/entities/purchase-order.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';

export const createPurchaseInvoiceSchema = Joi.object({
  purchase_order_id: Joi.number()
    .allow(null)
    .external(async (value) => {
      if (value !== null) {
        const purchaseOrder = await PurchaseOrder.findOne({
          where: { id: value },
        });
        if (!purchaseOrder) {
          throw new Joi.ValidationError(
            'any.purchase-order-not-found',
            [
              {
                message: 'Purchase order not found',
                path: ['purchase_order_id'],
                type: 'any.purchase-order-not-found',
                context: {
                  key: 'purchase_order_id',
                  label: 'purchase_order_id',
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
  date: Joi.date().required(),
  due_date: Joi.date().required(),
  tax: Joi.number().required(),
  shipping_cost: Joi.number().allow(null, ''),
  note: Joi.string().optional().default('').allow(null, ''),
  supplier_id: Joi.alternatives(
    Joi.number()
      .allow(null)
      .external(async (value) => {
        if (value !== null) {
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
        }

        return value;
      }),
  ),
  //   business_unit_id: Joi.alternatives(
  //     Joi.number()
  //       .allow(null)
  //       .external(async (value) => {
  //         const businessUnit = await BusinessUnit.findOne({
  //           where: { id: value },
  //         });
  //         if (!businessUnit) {
  //           throw new Joi.ValidationError(
  //             'any.business_unit_id',
  //             [
  //               {
  //                 message: 'Business unit not found',
  //                 path: ['business_unit_id'],
  //                 type: 'any.business-unit-not-found',
  //                 context: {
  //                   key: 'business_unit_id',
  //                   label: 'business_unit_id',
  //                   value,
  //                 },
  //               },
  //             ],
  //             value,
  //           );
  //         }
  //         return value;
  //       }),
  //   ),

  branch_id: Joi.alternatives(
    Joi.number()
      .allow(null)
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
  ),
  purchase_invoice_details: Joi.array().items(
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
      unit_price: Joi.number().required(),
      update_order: Joi.boolean().optional().default(false),
    }),
  ),
}).options({ abortEarly: false });
