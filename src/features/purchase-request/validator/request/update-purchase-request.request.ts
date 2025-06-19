import * as Joi from 'joi';
import { Branch } from 'src/features/branch/entities/branch.entity';

export const updatePurchaseRequestSchema = Joi.object({
  date: Joi.date().required(),
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
