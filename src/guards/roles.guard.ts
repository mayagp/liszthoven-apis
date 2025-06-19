import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import UserRoleEnum from 'src/features/staff/enums/user-role.enum';

@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    let userRole: UserRoleEnum | null = null;

    if (user.staff?.role !== undefined && user.staff?.role !== null) {
      userRole = +user.staff.role;
    } else if (user.supplier) {
      userRole = UserRoleEnum.SUPPLIER;
    }

    if (!userRole) {
      throw new UnauthorizedException('Unauthorized');
    }

    return requiredRoles.includes(userRole);
  }
}
