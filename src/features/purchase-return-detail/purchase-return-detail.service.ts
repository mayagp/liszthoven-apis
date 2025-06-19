import { Injectable } from '@nestjs/common';
import { CreatePurchaseReturnDetailDto } from './dto/create-purchase-return-detail.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseInvoiceDetail } from '../purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import PurchaseInvoiceStatus from '../purchase-invoice/enum/purchase-invoice-status.enum';
import { PurchaseReturn } from '../purchase-return/entities/purchase-return.entity';
import { PurchaseReturnDetail } from './entities/purchase-return-detail.entity';
import { Sequelize } from 'sequelize-typescript';
import { GoodsReceiptDetail } from '../goods-receipt-detail/entities/goods-receipt-detail.entity';
import PurchaseReturnDestination from '../purchase-return/enum/purchase-return-destination.enum';
import PurchaseReturnStatus from '../purchase-return/enum/purchase-return-status.enum';
import GoodsReceiptStatusEnum from '../goods-receipt/enum/goods-receipt-status.enum';

@Injectable()
export class PurchaseReturnDetailService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseReturn)
    private purchaseReturnModel: typeof PurchaseReturn,
    @InjectModel(PurchaseReturnDetail)
    private purchaseReturnDetailModel: typeof PurchaseReturnDetail,
  ) {}

  async create(
    purchaseReturnId: number,
    createPurchaseReturnDetailDto: CreatePurchaseReturnDetailDto,
  ) {
    let data: PurchaseInvoiceDetail | GoodsReceiptDetail | null = null;
    let supplierId: number | null = null;

    const purchaseReturn =
      await this.purchaseReturnModel.findByPk(purchaseReturnId);

    if (!purchaseReturn) {
      return this.response.fail('Purchase return not found', 404);
    }

    const isDetailExists = await this.purchaseReturnDetailModel.findOne({
      where: {
        purchase_return_id: purchaseReturnId,
        purchaseable_id: createPurchaseReturnDetailDto.purchaseable_id,
      },
    });

    if (isDetailExists) {
      return this.response.fail('Detail already exists', 400);
    }

    if (purchaseReturn.destination === PurchaseReturnDestination.INVOICE) {
      data = await PurchaseInvoiceDetail.findByPk(
        +createPurchaseReturnDetailDto.purchaseable_id,
        { include: [{ association: 'purchase_invoice' }] },
      );

      if (!data) {
        return this.response.fail('Detail not found', 400);
      }

      if (createPurchaseReturnDetailDto.quantity > data.remaining_quantity) {
        return this.response.fail('insufficient amount', 400);
      }

      if (data.purchase_invoice.status !== PurchaseInvoiceStatus.APPROVED) {
        return this.response.fail(
          'Purchase invoice status is not approved',
          400,
        );
      }

      createPurchaseReturnDetailDto.purchaseable_type =
        PurchaseInvoiceDetail.name;
      supplierId = data.purchase_invoice.supplier_id;
    } else if (
      purchaseReturn.destination === PurchaseReturnDestination.GOODS_RECEIPT
    ) {
      data = await GoodsReceiptDetail.findByPk(
        +createPurchaseReturnDetailDto.purchaseable_id,
        { include: [{ association: 'goods_receipt' }] },
      );

      if (!data) {
        return this.response.fail('Detail not found', 400);
      }

      if (data.goods_receipt.status !== GoodsReceiptStatusEnum.COMPLETED) {
        return this.response.fail('Goods receipt status is not completed', 400);
      }

      createPurchaseReturnDetailDto.purchaseable_type = GoodsReceiptDetail.name;
      supplierId = data.goods_receipt.supplier_id;
    }

    if (supplierId === null) {
      return this.response.fail('Supplier ID could not be determined', 400);
    }

    if (+supplierId !== +purchaseReturn.supplier_id) {
      return this.response.fail('Some detail have different supplier', 400);
    }
    if (+supplierId !== +purchaseReturn.supplier_id) {
      return this.response.fail('Some detail have different supplier', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchaseReturn.increment('amount', {
        by: createPurchaseReturnDetailDto.amount,
        transaction: transaction,
      });

      const purchaseRequestDetail = await this.purchaseReturnDetailModel.create(
        {
          ...createPurchaseReturnDetailDto,
          purchase_return_id: purchaseReturn.id,
        },
      );

      await transaction.commit();
      return this.response.success(
        purchaseRequestDetail,
        200,
        'Successfully create purchase return detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create purchase return detail', 400);
    }
  }

  async update(
    purchaseReturnId: number,
    purchaseReturnDetailId: number,
    updatePurchaseReturnDetailDto: CreatePurchaseReturnDetailDto,
  ) {
    let data: PurchaseInvoiceDetail | GoodsReceiptDetail | null = null;

    let supplierId: number | null = null;

    const purchaseReturn = await this.purchaseReturnModel.findByPk(
      purchaseReturnId,
      { include: [{ association: 'purchase_return_details' }] },
    );

    if (!purchaseReturn) {
      return this.response.fail('Purchase return not found', 404);
    }

    const purchaseReturnDetail = purchaseReturn.purchase_return_details.find(
      (value) => +value.id === purchaseReturnDetailId,
    );

    if (!purchaseReturnDetail) {
      return this.response.fail('Purchase return detail not found', 404);
    }
    if (
      +updatePurchaseReturnDetailDto.purchaseable_id !==
      purchaseReturnDetail.purchaseable_id
    ) {
      const isAlreadyExists = purchaseReturn.purchase_return_details.find(
        (value) =>
          +value.purchaseable_id ===
            +updatePurchaseReturnDetailDto.purchaseable_id &&
          +value.id !== +purchaseReturnDetailId,
      );

      if (isAlreadyExists) {
        return this.response.fail('Detail already exists', 400);
      }

      if (purchaseReturn.destination === PurchaseReturnDestination.INVOICE) {
        data = await PurchaseInvoiceDetail.findByPk(
          +updatePurchaseReturnDetailDto.purchaseable_id,
          { include: [{ association: 'purchase_invoice' }] },
        );

        if (!data) {
          return this.response.fail('Detail not found', 400);
        }

        if (data.purchase_invoice.status !== PurchaseInvoiceStatus.APPROVED) {
          return this.response.fail(
            'Purchase invoice status is not approved',
            400,
          );
        }

        if (updatePurchaseReturnDetailDto.quantity > data.remaining_quantity) {
          return this.response.fail('insufficient amount', 400);
        }

        updatePurchaseReturnDetailDto.purchaseable_type =
          PurchaseInvoiceDetail.name;
        supplierId = data.purchase_invoice.supplier_id;
      } else if (
        purchaseReturn.destination === PurchaseReturnDestination.GOODS_RECEIPT
      ) {
        data = await GoodsReceiptDetail.findByPk(
          +updatePurchaseReturnDetailDto.purchaseable_id,
          { include: [{ association: 'goods_receipt' }] },
        );

        if (!data) {
          return this.response.fail('Detail not found', 400);
        }

        if (data.goods_receipt.status !== GoodsReceiptStatusEnum.COMPLETED) {
          return this.response.fail(
            'Goods receipt status is not completed',
            400,
          );
        }

        updatePurchaseReturnDetailDto.purchaseable_type =
          GoodsReceiptDetail.name;
        supplierId = data.goods_receipt.supplier_id;
      }

      if (supplierId === null) {
        return this.response.fail('Supplier ID could not be determined', 400);
      }

      if (+supplierId !== +purchaseReturn.supplier_id) {
        return this.response.fail('Some detail have different supplier', 400);
      }
      if (+supplierId !== +purchaseReturn.supplier_id) {
        return this.response.fail('Some detail have different supplier', 400);
      }
    }

    const transaction = await this.sequelize.transaction();
    try {
      const oldAmount = purchaseReturnDetail.amount;

      await purchaseReturn.increment('amount', {
        by: +updatePurchaseReturnDetailDto.amount - +oldAmount,
        transaction: transaction,
      });

      await purchaseReturnDetail.update(
        {
          ...updatePurchaseReturnDetailDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        purchaseReturnDetail,
        200,
        'Successfully update purchase return detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update purchase return detail', 400);
    }
  }

  async delete(id: number) {
    const purchaseReturnDetail = await this.purchaseReturnDetailModel.findOne({
      where: { id: id },
      include: [{ association: 'purchase_return' }],
    });

    if (!purchaseReturnDetail) {
      return this.response.fail('Purchase return detail not found', 404);
    }

    if (
      purchaseReturnDetail.purchase_return.status ===
      PurchaseReturnStatus.COMPLETE
    ) {
      return this.response.fail('Purchase return status already complete', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchaseReturnDetail.purchase_return.decrement('amount', {
        by: purchaseReturnDetail.amount,
        transaction: transaction,
      });
      await purchaseReturnDetail.destroy({ transaction: transaction });
      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase return detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to delete purchase return detail', 400);
    }
  }
}
