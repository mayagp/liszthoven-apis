import { SetMetadata } from '@nestjs/common';
import UserRoleEnum from 'src/features/staff/enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...userRoleEnum: UserRoleEnum[]) =>
  SetMetadata(ROLES_KEY, userRoleEnum);
