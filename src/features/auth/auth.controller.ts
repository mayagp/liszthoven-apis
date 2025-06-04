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
import { registerSchema } from './validator/request/register.request';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AdminAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  register(
    @Body(new JoiValidationPipe(registerSchema))
    createUserDto: CreateUserDto,
  ) {
    return this.authService.register(createUserDto);
  }
}
