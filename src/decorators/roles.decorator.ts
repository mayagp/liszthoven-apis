import { SetMetadata } from '@nestjs/common';
import StaffRoleEnum from 'src/features/staff/enums/staff-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...staffRoleEnum: StaffRoleEnum[]) =>
  SetMetadata(ROLES_KEY, staffRoleEnum);
