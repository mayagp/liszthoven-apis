import { Injectable } from '@nestjs/common';
import { CreatePurchaseRequestDetailDto } from './dto/create-purchase-request-detail.dto';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseRequest } from '../purchase-request/entities/purchase-request.entity';
import PurchaseRequestStatus from '../purchase-request/enum/purchase-request-status.enum';
import { PurchaseRequestDetail } from './entities/purchase-request-detail.entity';

@Injectable()
export class PurchaseRequestDetailService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseRequest)
    private purchaseRequestModel: typeof PurchaseRequest,
    @InjectModel(PurchaseRequestDetail)
    private purchaseRequestDetailModel: typeof PurchaseRequestDetail,
  ) {}

  async create(
    purchaseRequestId: number,
    createPurchaseRequestDetailDto: CreatePurchaseRequestDetailDto,
  ) {
    const purchaseRequest = await this.purchaseRequestModel.findOne({
      where: { id: purchaseRequestId },
    });

    if (!purchaseRequest) {
      return this.response.fail('Purchase request not found', 404);
    }

    if (purchaseRequest.status !== PurchaseRequestStatus.NEED_APPROVAL) {
      return this.response.fail(
        'Purchase request status is not need approval',
        400,
      );
    }

    const isProductExists = await this.purchaseRequestDetailModel.findOne({
      where: {
        product_id: createPurchaseRequestDetailDto.product_id,
        purchase_request_id: purchaseRequestId,
      },
    });

    if (isProductExists) {
      return this.response.fail(
        'Product already exists, please use update instead create',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      const purchaseRequestDetail =
        await this.purchaseRequestDetailModel.create(
          {
            ...createPurchaseRequestDetailDto,
            purchase_request_id: purchaseRequestId,
          },
          { transaction: transaction },
        );

      await transaction.commit();

      await purchaseRequestDetail.reload({
        include: [
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
        ],
      });
      return this.response.success(
        purchaseRequestDetail,
        200,
        'Successfully create purchase request detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        'Failed to create purchase request detail',
        400,
      );
    }
  }

  async update(
    purchaseRequestId: number,
    purchaseRequestDetailId: number,
    updatePurchaseRequestDetailDto: CreatePurchaseRequestDetailDto,
  ) {
    const purchaseRequest = await this.purchaseRequestModel.findOne({
      where: { id: purchaseRequestId },
    });

    if (!purchaseRequest) {
      return this.response.fail('Purchase request not found', 404);
    }

    if (purchaseRequest.status !== PurchaseRequestStatus.NEED_APPROVAL) {
      return this.response.fail(
        'Purchase request status is not need approval',
        400,
      );
    }

    const purchaseRequestDetail = await this.purchaseRequestDetailModel.findOne(
      {
        where: {
          id: purchaseRequestDetailId,
          purchase_request_id: purchaseRequestId,
        },
      },
    );

    const transaction = await this.sequelize.transaction();

    if (!purchaseRequestDetail) {
      await transaction.rollback();
      return this.response.fail('Purchase request detail not found', 404);
    }
    try {
      await purchaseRequestDetail.update(
        {
          ...updatePurchaseRequestDetailDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();

      await purchaseRequestDetail.reload({
        include: [
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
        ],
      });
      return this.response.success(
        purchaseRequestDetail,
        200,
        'Successfully update purchase request detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        'Failed to update purchase request detail',
        400,
      );
    }
  }

  async delete(purchaseRequestId: number, purchaseRequestDetailId: number) {
    const purchaseRequest = await this.purchaseRequestModel.findOne({
      where: { id: purchaseRequestId },
    });

    if (!purchaseRequest) {
      return this.response.fail('Purchase request not found', 404);
    }
    if (purchaseRequest.status !== PurchaseRequestStatus.NEED_APPROVAL) {
      return this.response.fail(
        'Purchase request status is not need approval',
        400,
      );
    }

    const purchaseRequestDetail = await this.purchaseRequestDetailModel.findOne(
      {
        where: {
          id: purchaseRequestDetailId,
          purchase_request_id: purchaseRequestId,
        },
      },
    );
    if (!purchaseRequestDetail) {
      return this.response.fail('Purchase request detail not found', 404);
    }

    try {
      // force delete purchase request detail
      await purchaseRequestDetail.destroy();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase request detail',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
