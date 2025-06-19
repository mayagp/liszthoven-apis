import * as Joi from 'joi';
import { Branch } from 'src/features/branch/entities/branch.entity';
import { Supplier } from 'src/features/supplier/entities/supplier.entity';

export const updatePurchaseOrderSchema = Joi.object({
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
  tax: Joi.number().required(),
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
}).options({ abortEarly: false });
