import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Branch } from '../branch/entities/branch.entity';
import { User } from '../user/entities/user.entity';
import { Staff } from './entities/staff.entity';
import { AutoNumberService } from '../auto-number/auto-number.service';
import { AutoNumber } from '../auto-number/entities/auto-number.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Staff,
      Branch,
      // StaffUnit,
      AutoNumber,
    ]),
  ],
  controllers: [StaffController],
  providers: [StaffService, AutoNumberService],
  exports: [StaffService],
})
export class StaffModule {}
