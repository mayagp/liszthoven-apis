import { Injectable } from '@nestjs/common';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestDto } from './dto/update-purchase-request.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseRequestDetail } from '../purchase-request-detail/entities/purchase-request-detail.entity';
import SupplierQuotationStatus from '../supplier-quotation/enum/supplier-quotation-status.enum';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { Sequelize } from 'sequelize-typescript';
import { AutoNumberService } from '../auto-number/auto-number.service';
import { User } from '../user/entities/user.entity';
import PurchaseRequestStatus from './enum/purchase-request-status.enum';

@Injectable()
export class PurchaseRequestService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseRequest)
    private purchaseRequestModel: typeof PurchaseRequest,
    @InjectModel(PurchaseRequestDetail)
    private purchaseRequestDetailModel: typeof PurchaseRequestDetail,
    private autoNumberService: AutoNumberService,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.purchaseRequestModel,
      query,
    )
      .load('branch')
      .getResult();

    const result = {
      count: count,
      purchase_requests: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve purchase requests',
    );
  }

  async findOne(id: number) {
    try {
      const purchaseRequest = await this.purchaseRequestModel.findOne({
        where: { id },
        include: [
          {
            association: 'purchase_request_details',
            include: [
              {
                association: 'product',
                include: [{ association: 'product_images' }],
              },
            ],
          },
          {
            association: 'branch',
          },
          {
            association: 'created_by_user',
          },
          {
            association: 'approved_by_user',
          },
        ],
      });
      return this.response.success(
        purchaseRequest,
        200,
        'Successfully get purchase request',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createPurchaseRequestDto: CreatePurchaseRequestDto, user: User) {
    const transaction = await this.sequelize.transaction();
    try {
      createPurchaseRequestDto.purchase_request_no =
        await this.autoNumberService.generateAutoNumber(
          PurchaseRequest.name,
          transaction,
        );

      const purchaseRequest = await this.purchaseRequestModel.create(
        {
          ...createPurchaseRequestDto,
          created_by: user.id,
        },
        {
          include: [
            {
              association: 'purchase_request_details',
              include: [
                {
                  association: 'product',
                  include: [{ association: 'product_images' }],
                },
              ],
            },
            {
              association: 'branch',
            },
            {
              association: 'created_by_user',
            },
          ],
          transaction: transaction,
        },
      );

      await transaction.commit();
      return this.response.success(
        purchaseRequest,
        200,
        'Successfully create purchase request',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(id: number, updatePurchaseRequestDto: UpdatePurchaseRequestDto) {
    const purchaseRequest = await this.purchaseRequestModel.findByPk(id);

    const transaction = await this.sequelize.transaction();

    if (!purchaseRequest) {
      await transaction.rollback();
      return this.response.fail('Purchase Request not found', 404);
    }
    try {
      await purchaseRequest.update(
        {
          ...updatePurchaseRequestDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();

      await purchaseRequest.reload({
        include: [
          {
            association: 'branch',
          },
        ],
      });
      return this.response.success(
        purchaseRequest,
        200,
        'Successfully update purchase request',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update purchase request', 400);
    }
  }

  async delete(id: number) {
    const purchaseRequest = await this.purchaseRequestModel.findOne({
      where: { id: id },
      include: [{ association: 'purchase_request_details' }],
    });
    if (!purchaseRequest) {
      return this.response.fail('Purchase Request not found', 404);
    }

    if (purchaseRequest.status === PurchaseRequestStatus.APPROVED) {
      return this.response.fail(
        'Purchase request status already approved',
        400,
      );
    }

    try {
      const purchaseRequestDetailIds =
        purchaseRequest.purchase_request_details.map((value) => +value.id);

      await this.purchaseRequestDetailModel.destroy({
        where: { id: { [Op.in]: purchaseRequestDetailIds } },
      });
      await purchaseRequest.destroy();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase request',
      );
    } catch (error) {
      return this.response.fail('Failed to delete purchase request', 400);
    }
  }

  // async setStatusAsApprovalRequest(id: number) {
  //   const purchaseRequest = await this.purchaseRequestModel.findOne({
  //     where: { id: id },
  //   });

  //   if (!purchaseRequest) {
  //     return this.response.fail('Purchase request not found', 404);
  //   }

  //   if (purchaseRequest.status !== SupplierQuotationStatus.PENDING) {
  //     return this.response.fail('Purchase request status is not pending', 400);
  //   }

  //   try {
  //     await purchaseRequest.update({
  //       status: PurchaseRequestStatus.APPROVAL_REQUEST,
  //     });
  //     return this.response.success(
  //       purchaseRequest,
  //       200,
  //       'Successfully set status as approval request',
  //     );
  //   } catch (error) {
  //     return this.response.fail(
  //       'Failed to set status as approval request',
  //       400,
  //     );
  //   }
  // }

  async setStatusAsRejected(id: number) {
    const purchaseRequest = await this.purchaseRequestModel.findOne({
      where: { id: id },
    });

    if (!purchaseRequest) {
      return this.response.fail('Purchase request not found', 404);
    }

    if (purchaseRequest.status === PurchaseRequestStatus.APPROVED) {
      return this.response.fail('Purchase request already approved', 400);
    }

    try {
      await purchaseRequest.update({
        status: PurchaseRequestStatus.REJECTED,
      });
      return this.response.success(
        purchaseRequest,
        200,
        'Successfully set status as rejected',
      );
    } catch (error) {
      return this.response.fail('Failed to set status as rejected', 400);
    }
  }

  async setStatusAsApproved(id: number, user: User) {
    const purchaseRequest = await this.purchaseRequestModel.findOne({
      where: { id: id },
    });

    if (!purchaseRequest) {
      return this.response.fail('Purchase request not found', 404);
    }

    try {
      await purchaseRequest.update({
        status: PurchaseRequestStatus.APPROVED,
        approved_at: new Date(),
        approved_by: user.id,
      });
      return this.response.success(
        purchaseRequest,
        200,
        'Successfully set status as approved',
      );
    } catch (error) {
      return this.response.fail('Failed to set status as approved', 400);
    }
  }
}
