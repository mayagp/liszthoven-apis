import { Module } from '@nestjs/common';
import { SubdistrictService } from './subdistrict.service';
import { SubdistrictController } from './subdistrict.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Subdistrict } from './entities/subdistrict.entity';

@Module({
  imports: [SequelizeModule.forFeature([Subdistrict])],
  controllers: [SubdistrictController],
  providers: [SubdistrictService],
})
export class SubdistrictModule {}
