import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from 'src/guards/admin-auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

export function AdminAuth() {
  return applyDecorators(UseGuards(JwtAuthGuard, AdminAuthGuard));
}
