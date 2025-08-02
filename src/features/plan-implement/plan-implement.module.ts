import { Module } from '@nestjs/common';
import { PlanImplementService } from './plan-implement.service';
import { PlanImplementController } from './plan-implement.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchasePlan } from '../purchase-plan/entities/purchase-plan.entity';
import { PlanImplement } from './entities/plan-implement.entity';

@Module({
  imports: [SequelizeModule.forFeature([PurchasePlan, PlanImplement])],
  controllers: [PlanImplementController],
  providers: [PlanImplementService],
})
export class PlanImplementModule {}
