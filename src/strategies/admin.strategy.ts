import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/features/auth/auth.service';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(private readonly authAdminService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.authAdminService.validateUser(username, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
