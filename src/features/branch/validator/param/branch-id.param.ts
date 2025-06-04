import * as Joi from 'joi';
import { Branch } from '../../entities/branch.entity';

export const branchIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const branch = await Branch.findByPk(value);
    if (!branch) {
      throw new Joi.ValidationError(
        'any.invalid-branch-id',
        [
          {
            message: 'branch not found',
            path: ['id'],
            type: 'any.invalid-branch-id',
            context: {
              key: 'id',
              label: 'id',
              value,
            },
          },
        ],
        value,
      );
    }
  });
