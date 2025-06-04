import { Module } from '@nestjs/common';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { City } from './entities/city.entity';

@Module({
  imports: [SequelizeModule.forFeature([City])],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
