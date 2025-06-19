import * as Joi from 'joi';
import { Product } from 'src/features/product/entities/product.entity';
import { PurchaseInvoice } from 'src/features/purchase-invoice/entities/purchase-invoice.entity';
import { Warehouse } from 'src/features/warehouse/entities/warehouse.entity';

export const createGoodsReceiptSchema = Joi.object({
  date: Joi.date().required(),
  note: Joi.string().optional().default('').allow(null, ''),
  purchase_invoice_id: Joi.number()
    .required()
    .external(async (value) => {
      const purchaseInvoice = await PurchaseInvoice.findOne({
        where: { id: value },
      });
      if (!purchaseInvoice) {
        throw new Joi.ValidationError(
          'any.purchase_invoice_id',
          [
            {
              message: 'Purchase invoice not found',
              path: ['purchase_invoice_id'],
              type: 'any.purchase-invoice-id-not-found',
              context: {
                key: 'purchase_invoice_id',
                label: 'purchase_invoice_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  warehouse_id: Joi.number()
    .required()
    .external(async (value) => {
      const warehouse = await Warehouse.findOne({
        where: { id: value },
      });
      if (!warehouse) {
        throw new Joi.ValidationError(
          'any.warehouse_id',
          [
            {
              message: 'Warehouse not found',
              path: ['warehouse_id'],
              type: 'any.warehouse-not-found',
              context: {
                key: 'warehouse_id',
                label: 'warehouse_id',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  goods_receipt_details: Joi.array().items(
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
      quantity: Joi.number().required().min(1),
      gr_serial_numbers: Joi.array()
        .optional()
        .items(
          Joi.object({
            serial_number: Joi.string(),
          }),
        ),
    }),
  ),
}).options({ abortEarly: false });
