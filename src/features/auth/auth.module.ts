import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { Branch } from '../branch/entities/branch.entity';
import { Staff } from '../staff/entities/staff.entity';
import { StaffUnit } from '../user/entities/staff-unit.entity';
import { User } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminStrategy } from 'src/strategies/admin.strategy';
import { UserService } from '../user/user.service';
import { LocalStrategy } from 'src/strategies/local.strategy';
import { Supplier } from '../supplier/entities/supplier.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      // EmailVerification,
      // ForgotPassword,
      Staff,
      Branch,
      // StaffUnit,
      Supplier,
      // MidtransPayment,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '10h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AdminStrategy,
    JwtStrategy,
    UserService,
    LocalStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
