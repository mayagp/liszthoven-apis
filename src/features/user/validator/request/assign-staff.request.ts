import * as Joi from 'joi';
import { Branch } from 'src/features/branch/entities/branch.entity';

export const assignStaffSchema = Joi.object({
  branch: Joi.array()
    .items(
      Joi.object({
        id: Joi.number()
          .required()
          .external(async (value) => {
            const branch = await Branch.findOne({
              where: { id: value },
            });
            if (!branch) {
              throw new Joi.ValidationError(
                'any.branch-not-found',
                [
                  {
                    message: 'Branch not found',
                    path: ['branchs.*.id'],
                    type: 'any.Branch-not-found',
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
            return value;
          }),
      }),
    )
    .min(1)
    .required(),
}).options({ abortEarly: false });
