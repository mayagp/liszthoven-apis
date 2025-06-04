import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Branch } from '../branch/entities/branch.entity';
import { Staff } from '../staff/entities/staff.entity';
import { StaffUnit } from './entities/staff-unit.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, Staff, Branch, StaffUnit])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
