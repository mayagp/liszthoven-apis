import * as Joi from 'joi';
import { SerializeItem } from '../../entities/serialize-item.entity';

export const serializeItemIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const serializeItem = await SerializeItem.findByPk(value);
    if (!serializeItem) {
      throw new Joi.ValidationError(
        'any.invalid-serialize-item-id',
        [
          {
            message: 'Serialize item not found',
            path: ['id'],
            type: 'any.invalid-serialize-item-id',
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
