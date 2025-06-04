import * as Joi from 'joi';
import { Branch } from 'src/features/branch/entities/branch.entity';
import GenderEnum from 'src/features/staff/enums/gender.enum';
import ReligionEnum from 'src/features/staff/enums/religion.enum';
import StaffRoleEnum from 'src/features/staff/enums/staff-role.enum';
import { User } from 'src/features/user/entities/user.entity';

export const registerSchema = Joi.object({
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
  gender: Joi.number().valid(
    GenderEnum.MALE,
    GenderEnum.FEMALE,
    GenderEnum.OTHER,
  ),
  password: Joi.string().min(8),
  address: Joi.string().allow('', null),
  phone_no: Joi.string().allow('', null),
  birth_date: Joi.date().allow('', null),
  staff: Joi.object({
    identification_number: Joi.string().allow('', null),
    tax_number: Joi.string().allow('', null),
    bpjs_number: Joi.string().allow('', null),
    working_since: Joi.date().allow('', null),
    religion: Joi.number().valid(
      ReligionEnum.BUDDHISM,
      ReligionEnum.CATHOLIC,
      ReligionEnum.HINDUISM,
      ReligionEnum.ISLAM,
      ReligionEnum.CHRISTIANITY,
      ReligionEnum.OTHER,
    ),
    note: Joi.string().optional().default('').allow(null, ''),
    role: Joi.number()
      .required()
      .valid(
        StaffRoleEnum.ADMIN,
        StaffRoleEnum.DEVELOPER,
        StaffRoleEnum.OWNER,
        StaffRoleEnum.ADMIN_MANAGER,
        StaffRoleEnum.COMMISSIONER,
        StaffRoleEnum.DIRECTOR,
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
