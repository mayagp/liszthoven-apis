import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Branch } from '../branch/entities/branch.entity';
import { Staff } from '../staff/entities/staff.entity';
import { User } from './entities/user.entity';
import { Supplier } from '../supplier/entities/supplier.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Staff,
      Branch,
      // StaffUnit,
      Supplier,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
