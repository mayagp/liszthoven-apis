import * as Joi from 'joi';
import { Warehouse } from '../../entities/warehouse.entity';
import { Branch } from 'src/features/branch/entities/branch.entity';

export const createWarehouseSchema = Joi.object({
  code: Joi.string()
    .required()
    .external(async (value) => {
      const warehouse = await Warehouse.findOne({
        where: { code: value },
      });
      if (warehouse) {
        throw new Joi.ValidationError(
          'any.code',
          [
            {
              message: 'Warehouse code already taken',
              path: ['code'],
              type: 'any.warehouse-code-taken',
              context: {
                key: 'code',
                label: 'code',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  name: Joi.string().required(),
  location: Joi.string().required(),
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
