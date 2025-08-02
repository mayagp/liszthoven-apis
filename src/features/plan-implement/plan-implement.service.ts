import { Injectable } from '@nestjs/common';
import { CreatePlanImplementDto } from './dto/create-plan-implement.dto';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseInvoiceDetail } from '../purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import { PurchasePlan } from '../purchase-plan/entities/purchase-plan.entity';
import { PlanImplement } from './entities/plan-implement.entity';
import { UpdatePlanImplementDto } from './dto/update-plan-implement.dto';

@Injectable()
export class PlanImplementService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchasePlan)
    private purchasePlanModel: typeof PurchasePlan,
    @InjectModel(PlanImplement)
    private planImplementModel: typeof PlanImplement,
  ) {}

  async create(
    purchasePlanId: number,
    createPlanImplementDto: CreatePlanImplementDto,
  ) {
    const purchasePlan = await this.purchasePlanModel.findByPk(+purchasePlanId);

    if (!purchasePlan) {
      return this.response.fail('Purchase plan not found', 404);
    }

    let plan: PurchaseOrderDetail | PurchaseInvoiceDetail | null = null;

    if (createPlanImplementDto.planable_type === 'purchase_order_details') {
      plan = await PurchaseOrderDetail.findByPk(
        createPlanImplementDto.planable_id,
      );
    } else {
      plan = await PurchaseInvoiceDetail.findByPk(
        createPlanImplementDto.planable_id,
      );
    }

    if (!plan) {
      return this.response.fail('Planable data not found', 404);
    }

    if (plan.product_id !== purchasePlan.product_id) {
      return this.response.fail(
        'Order/Invoice is different from plan product',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      const planImplement = await this.planImplementModel.create(
        {
          purchase_plan_id: purchasePlanId,
          ...createPlanImplementDto,
        },
        { transaction },
      );
      await transaction.commit();
      return this.response.success(
        planImplement,
        200,
        'Successfully create plan implement',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create purchase plan', 400);
    }
  }

  async update(id: number, updatePlanImplementDto: UpdatePlanImplementDto) {
    const implementPlan = await this.planImplementModel.findOne({
      where: { id: id },
    });

    if (!implementPlan) {
      return this.response.fail('Implement plan not found', 404);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await implementPlan.update(updatePlanImplementDto, {
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        implementPlan,
        200,
        'Successfully update plan implement',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update plan implement', 400);
    }
  }

  async delete(id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      await this.planImplementModel.destroy({
        where: { id },
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete plan implement',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
