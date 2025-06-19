import * as Joi from 'joi';
import { Branch } from 'src/features/branch/entities/branch.entity';
import UserRoleEnum from 'src/features/staff/enums/user-role.enum';
import { User } from 'src/features/user/entities/user.entity';

export const registerStaffSchema = Joi.object({
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
  phone_no: Joi.string().allow('', null),
  birth_date: Joi.date().allow('', null),
  staff: Joi.object({
    identification_number: Joi.string().allow('', null),
    tax_number: Joi.string().allow('', null),
    bpjs_number: Joi.string().allow('', null),
    working_since: Joi.date().allow('', null),
    note: Joi.string().optional().default('').allow(null, ''),
    role: Joi.number()
      .required()
      .valid(
        UserRoleEnum.BRANCH_ADMIN,
        UserRoleEnum.ADMIN_MANAGER,
        UserRoleEnum.OWNER,
        UserRoleEnum.SUPPLIER,
      ),
    branch_id: Joi.number()
      .optional()
      .external(async (value) => {
        if (value) {
          const branch = await Branch.findOne({ where: { id: value } });
          if (!branch) {
            throw new Joi.ValidationError(
              'branch_id-not-exists',
              [
                {
                  message: 'company branch not exists',
                  path: ['branch_id'],
                  type: 'branch_id-not-exists',
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
        }
        return value;
      }),
  }),
});
