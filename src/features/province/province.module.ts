import { Module } from '@nestjs/common';
import { ProvinceService } from './province.service';
import { ProvinceController } from './province.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Province } from './entities/province.entity';

@Module({
  imports: [SequelizeModule.forFeature([Province])],
  controllers: [ProvinceController],
  providers: [ProvinceService],
})
export class ProvinceModule {}
