import { Module } from '@nestjs/common';
import { AutoNumberService } from './auto-number.service';
import { AutoNumberController } from './auto-number.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutoNumber } from './entities/auto-number.entity';

@Module({
  imports: [SequelizeModule.forFeature([AutoNumber])],
  controllers: [AutoNumberController],
  providers: [AutoNumberService],
})
export class AutoNumberModule {}
