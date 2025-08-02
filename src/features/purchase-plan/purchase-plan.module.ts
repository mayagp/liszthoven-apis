import { Module } from '@nestjs/common';
import { PurchasePlanService } from './purchase-plan.service';
import { PurchasePlanController } from './purchase-plan.controller';
import { PurchasePlan } from './entities/purchase-plan.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlanImplement } from '../plan-implement/entities/plan-implement.entity';

@Module({
  imports: [SequelizeModule.forFeature([PurchasePlan, PlanImplement])],
  controllers: [PurchasePlanController],
  providers: [PurchasePlanService],
})
export class PurchasePlanModule {}
