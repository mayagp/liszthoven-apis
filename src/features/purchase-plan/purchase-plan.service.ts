import { Injectable } from '@nestjs/common';
import { CreatePurchasePlanDto } from './dto/create-purchase-plan.dto';
import { UpdatePurchasePlanDto } from './dto/update-purchase-plan.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import { PurchasePlan } from './entities/purchase-plan.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class PurchasePlanService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchasePlan)
    private purchasePlanModel: typeof PurchasePlan,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.purchasePlanModel,
      query,
    )
      .load('warehouse', 'product.product_images')
      .getResult();

    const result = {
      count: count,
      purchase_plans: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve purchase plans',
    );
  }

  async findOne(id: number) {
    try {
      const purchasePlan = await this.purchasePlanModel.findOne({
        where: { id },
        include: [
          {
            association: 'warehouse',
          },
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
          {
            association: 'plan_implements',
          },
        ],
      });

      if (!purchasePlan) {
        return this.response.fail('Purchase plan not found', 404);
      }
      for (const planImplement of purchasePlan.plan_implements) {
        if (planImplement.planable_type === PurchaseOrderDetail.name) {
          planImplement.planable = await PurchaseOrderDetail.findByPk(
            planImplement.planable_id,
            {
              include: [
                {
                  association: 'purchase_order',
                },
                {
                  association: 'supplier_quotation',
                },
              ],
            },
          );
        } else {
          planImplement.planable = await PurchaseInvoice.findByPk(
            planImplement.planable_id,
            {
              include: [
                {
                  association: 'purchase_invoice',
                },
              ],
            },
          );
        }
      }

      return this.response.success(
        purchasePlan,
        200,
        'Successfully retrieve purchase plan',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createPurchasePlanDto: CreatePurchasePlanDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const purchasePlan = await this.purchasePlanModel.create(
        {
          ...createPurchasePlanDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        purchasePlan,
        200,
        'Successfully create purchase plan',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create purchase plan', 400);
    }
  }

  async update(id: number, updatePurchasePlanDto: UpdatePurchasePlanDto) {
    const purchasePlan = await this.purchasePlanModel.findOne({
      where: { id: id },
    });

    if (!purchasePlan) {
      return this.response.fail('Purchase plan not found', 404);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchasePlan.update(updatePurchasePlanDto, {
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        purchasePlan,
        200,
        'Successfully update purchase plan',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update purchase plan', 400);
    }
  }

  async delete(id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      await this.purchasePlanModel.destroy({
        where: { id },
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase plan',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
