import * as Joi from 'joi';
import { PlanImplement } from '../../entities/plan-implement.entity';
export const planImplementIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const planImplement = await PlanImplement.findByPk(value);
    if (!planImplement) {
      throw new Joi.ValidationError(
        'any.invalid-plan-implement-id',
        [
          {
            message: 'Plan implement not found',
            path: ['id'],
            type: 'any.invalid-plan-implement-id',
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
