import * as Joi from 'joi';
import { User } from 'src/features/user/entities/user.entity';

export const registerSupplierSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string()
    .allow('', null)
    .external(async (value) => {
      if (value) {
        const user = await User.findOne({
          where: { username: value },
        });
        if (user) {
          throw new Joi.ValidationError(
            'any.username-exists',
            [
              {
                message: 'Username already exists',
                path: ['username'],
                type: 'any.username-exists',
                context: {
                  key: 'username',
                  label: 'username',
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
  email: Joi.string()
    .required()
    .external(async (value) => {
      const user = await User.findOne({
        where: { email: value },
      });
      if (user) {
        throw new Joi.ValidationError(
          'any.email-exists',
          [
            {
              message: 'email already exists',
              path: ['email'],
              type: 'any.email-exists',
              context: {
                key: 'email',
                label: 'email',
                value,
              },
            },
          ],
          value,
        );
      }
      return value;
    }),
  password: Joi.string().min(8),
  address: Joi.string().allow('', null),
  phone_no: Joi.string().required(),
  supplier: Joi.object({
    tax_no: Joi.string().allow('', null),
    total_payable: Joi.number().allow('', null),
    account_no: Joi.string().allow('', null),
    bank: Joi.string().allow('', null),
    swift_code: Joi.string().allow('', null),
  }),
});
