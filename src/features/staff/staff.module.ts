import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Branch } from '../branch/entities/branch.entity';
import { StaffUnit } from '../user/entities/staff-unit.entity';
import { User } from '../user/entities/user.entity';
import { Staff } from './entities/staff.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Staff,
      Branch,
      StaffUnit,
      // AutoNumber,
    ]),
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
