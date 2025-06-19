import * as Joi from 'joi';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';
import PurchaseReturnDestination from '../../enum/purchase-return-destination.enum';
import PurchaseReturnType from '../../enum/purchase-return-type.enum';

export const createPurchaseReturnSchema = Joi.object({
  destination: Joi.number()
    .required()
    .valid(
      PurchaseReturnDestination.INVOICE,
      PurchaseReturnDestination.GOODS_RECEIPT,
    ),
  date: Joi.date().required(),
  note: Joi.string().optional().default('').allow(null, ''),
  type: Joi.number()
    .required()
    .valid(PurchaseReturnType.REFUND, PurchaseReturnType.RETURN),
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
  purchase_return_details: Joi.array()
    .items(
      Joi.object({
        purchaseable_id: Joi.number().required(),
        quantity: Joi.number().required().min(1),
        amount: Joi.number().required(),
      }),
    )
    .min(1),
}).options({ abortEarly: false });
