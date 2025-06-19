import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminAuthGuard } from 'src/guards/admin-auth.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JoiValidationPipe } from 'src/validators/pipes/joi-validation.pipe';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { registerStaffSchema } from './validator/request/register-staff.request';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { registerSupplierSchema } from './validator/request/register-supplier.request';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AdminAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register/staff')
  registerStaff(
    @Body(new JoiValidationPipe(registerStaffSchema))
    createUserDto: CreateUserDto,
  ) {
    return this.authService.register(createUserDto);
  }

  @Post('register/supplier')
  registerSupplier(
    @Body(new JoiValidationPipe(registerSupplierSchema))
    createUserDto: CreateUserDto,
  ) {
    return this.authService.register(createUserDto);
  }
}
