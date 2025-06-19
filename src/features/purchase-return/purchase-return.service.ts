import { Injectable } from '@nestjs/common';
import { CreatePurchaseReturnDto } from './dto/create-purchase-return.dto';
import { UpdatePurchaseReturnDto } from './dto/update-purchase-return.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseInvoiceDetail } from '../purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import PurchaseInvoiceStatus from '../purchase-invoice/enum/purchase-invoice-status.enum';
import { PurchaseReturnDetail } from '../purchase-return-detail/entities/purchase-return-detail.entity';
import { PurchaseReturn } from './entities/purchase-return.entity';
import { Sequelize } from 'sequelize-typescript';
import { InventoryTransactionService } from '../inventory-transaction/inventory-transaction.service';
import { AutoNumberService } from '../auto-number/auto-number.service';
import { GoodsReceiptDetail } from '../goods-receipt-detail/entities/goods-receipt-detail.entity';
import GoodsReceiptStatusEnum from '../goods-receipt/enum/goods-receipt-status.enum';
import PurchaseReturnDestination from './enum/purchase-return-destination.enum';
import PurchaseReturnStatus from './enum/purchase-return-status.enum';
import PurchaseReturnType from './enum/purchase-return-type.enum';

@Injectable()
export class PurchaseReturnService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseReturn)
    private purchaseReturnModel: typeof PurchaseReturn,
    @InjectModel(PurchaseReturnDetail)
    private purchaseReturnDetailModel: typeof PurchaseReturnDetail,
    private readonly inventoryTransactionService: InventoryTransactionService,
    private autoNumberService: AutoNumberService,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.purchaseReturnModel,
      query,
    )
      .load('supplier')
      .getResult();

    const result = {
      count: count,
      purchase_returns: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve purchase returns',
    );
  }

  async findOne(id: number) {
    try {
      const purchaseReturn = await this.purchaseReturnModel.findOne({
        where: { id },
        include: [
          {
            association: 'purchase_return_details',
          },
          {
            association: 'supplier',
          },
          {
            association: 'purchase_return_documents',
          },
        ],
      });
      for (const purchaseReturnDetail of purchaseReturn?.purchase_return_details ??
        []) {
        if (
          purchaseReturnDetail.purchaseable_type === GoodsReceiptDetail.name
        ) {
          purchaseReturnDetail.purchaseable = await GoodsReceiptDetail.findByPk(
            purchaseReturnDetail.purchaseable_id,
            {
              include: [
                {
                  association: 'product',
                  include: [{ association: 'product_images' }],
                },
                {
                  association: 'goods_receipt',
                },
              ],
            },
          );
        } else {
          purchaseReturnDetail.purchaseable =
            await PurchaseInvoiceDetail.findByPk(
              purchaseReturnDetail.purchaseable_id,
              {
                include: [
                  {
                    association: 'product',
                    include: [{ association: 'product_images' }],
                  },
                  {
                    association: 'purchase_invoice',
                  },
                ],
              },
            );
        }
      }

      return this.response.success(
        purchaseReturn,
        200,
        'Successfully get purchase return',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createPurchaseReturnDto: CreatePurchaseReturnDto) {
    for (const purchaseReturnDetail of createPurchaseReturnDto.purchase_return_details) {
      let data: PurchaseInvoiceDetail | GoodsReceiptDetail | null = null;
      let supplierId: number | null = null;
      if (
        createPurchaseReturnDto.destination ===
        PurchaseReturnDestination.INVOICE
      ) {
        data = await PurchaseInvoiceDetail.findByPk(
          +purchaseReturnDetail.purchaseable_id,
          { include: [{ association: 'purchase_invoice' }] },
        );

        if (!data) {
          return this.response.fail('Detail not found', 400);
        }

        if (purchaseReturnDetail.quantity > data.remaining_quantity) {
          return this.response.fail('insufficient amount', 400);
        }

        if (data.purchase_invoice.status !== PurchaseInvoiceStatus.APPROVED) {
          return this.response.fail(
            'Purchase invoice status is not approved',
            400,
          );
        }

        purchaseReturnDetail.purchaseable_type = PurchaseInvoiceDetail.name;
        supplierId = data.purchase_invoice.supplier_id;
      } else if (
        createPurchaseReturnDto.destination ===
        PurchaseReturnDestination.GOODS_RECEIPT
      ) {
        data = await GoodsReceiptDetail.findByPk(
          +purchaseReturnDetail.purchaseable_id,
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

        purchaseReturnDetail.purchaseable_type = GoodsReceiptDetail.name;
        supplierId = data.goods_receipt.supplier_id;
      }

      if (supplierId === null) {
        return this.response.fail('Supplier ID is missing', 400);
      }

      if (+supplierId !== +createPurchaseReturnDto.supplier_id) {
        return this.response.fail('Some detail have different supplier', 400);
      }

      if (+supplierId !== +createPurchaseReturnDto.supplier_id) {
        return this.response.fail('Some detail have different supplier', 400);
      }
    }

    const transaction = await this.sequelize.transaction();
    try {
      createPurchaseReturnDto.purchase_return_no =
        await this.autoNumberService.generateAutoNumber(
          PurchaseReturn.name,
          transaction,
        );

      const grandtotal = createPurchaseReturnDto.purchase_return_details.reduce(
        (value, data) => value + data.amount,
        0,
      );

      const purchaseRequest = await this.purchaseReturnModel.create(
        {
          ...createPurchaseReturnDto,
          amount: grandtotal,
        },
        {
          include: [
            {
              association: 'purchase_return_details',
            },
            {
              association: 'supplier',
            },
          ],
          transaction: transaction,
        },
      );

      await transaction.commit();
      return this.response.success(
        purchaseRequest,
        200,
        'Successfully create purchase return',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(id: number, updatePurchaseReturnDto: UpdatePurchaseReturnDto) {
    const purchaseReturn = await this.purchaseReturnModel.findByPk(id);

    const transaction = await this.sequelize.transaction();

    if (!purchaseReturn) {
      await transaction.rollback();
      return this.response.fail('Purchase return not found', 404);
    }
    try {
      await purchaseReturn.update(
        {
          ...updatePurchaseReturnDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        purchaseReturn,
        200,
        'Successfully update purchase return',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update purchase return', 400);
    }
  }

  async delete(id: number) {
    const purchaseReturn = await this.purchaseReturnModel.findOne({
      where: { id: id },
      include: [{ association: 'purchase_return_details' }],
    });

    if (!purchaseReturn) {
      return this.response.fail('Purchase return not found', 404);
    }
    if (purchaseReturn.status === PurchaseReturnStatus.COMPLETE) {
      return this.response.fail('Purchase return status already complete', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      const purchaseReturnDetailIds =
        purchaseReturn.purchase_return_details.map((value) => +value.id);

      await this.purchaseReturnDetailModel.destroy({
        where: { id: { [Op.in]: purchaseReturnDetailIds } },
        transaction: transaction,
      });
      await purchaseReturn.destroy({ force: true, transaction });
      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase return',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to delete purchase return', 400);
    }
  }

  async cancel(id: number) {
    const purchaseReturn = await this.purchaseReturnModel.findOne({
      where: { id: id },
    });

    if (!purchaseReturn) {
      return this.response.fail('Purchase return not found', 404);
    }
    if (purchaseReturn.status !== PurchaseReturnStatus.DRAFT) {
      return this.response.fail(
        'Purchase return status already complete or cancelled',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();

    try {
      await purchaseReturn.update(
        { status: PurchaseReturnStatus.CANCELLED },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        purchaseReturn,
        200,
        'Successfully set status as cancelled',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to set status as cancelled', 400);
    }
  }

  async complete(id: number) {
    const purchaseReturn = await this.purchaseReturnModel.findOne({
      where: { id: id },
      include: [{ association: 'purchase_return_details' }],
    });
    if (!purchaseReturn) {
      return this.response.fail('Purchase return not found', 404);
    }

    if (purchaseReturn.status !== PurchaseReturnStatus.DRAFT) {
      return this.response.fail(
        'Purchase return status already complete or cancelled',
        400,
      );
    }

    for (const purchaseReturnDetail of purchaseReturn.purchase_return_details) {
      if (purchaseReturn.destination === PurchaseReturnDestination.INVOICE) {
        const purchaseInvoiceDetail = await PurchaseInvoiceDetail.findByPk(
          +purchaseReturnDetail.purchaseable_id,
          { include: [{ association: 'purchase_invoice' }] },
        );

        if (!purchaseInvoiceDetail) {
          return this.response.fail('Purchase invoice detail not found', 404);
        }

        if (
          purchaseReturnDetail.quantity >
          purchaseInvoiceDetail.remaining_quantity
        ) {
          return this.response.fail('insufficient amount', 400);
        }

        if (
          purchaseInvoiceDetail.purchase_invoice.status !==
          PurchaseInvoiceStatus.APPROVED
        ) {
          return this.response.fail(
            'Purchase invoice status is not approved',
            400,
          );
        }
      }
    }

    const transaction = await this.sequelize.transaction();
    try {
      for (const purchaseReturnDetail of purchaseReturn.purchase_return_details) {
        if (purchaseReturn.destination === PurchaseReturnDestination.INVOICE) {
          const purchaseInvoiceDetail = await PurchaseInvoiceDetail.findByPk(
            +purchaseReturnDetail.purchaseable_id,
            { include: [{ association: 'purchase_invoice' }], transaction },
          );
          if (!purchaseInvoiceDetail) {
            return this.response.fail('Purchase invoice detail not found', 404);
          }

          await purchaseInvoiceDetail.purchase_invoice.decrement(
            'remaining_amount',
            { by: purchaseReturnDetail.amount, transaction: transaction },
          );
          if (purchaseReturn.type === PurchaseReturnType.RETURN) {
            await purchaseInvoiceDetail.decrement('remaining_quantity', {
              by: purchaseReturnDetail.quantity,
              transaction: transaction,
            });

            const purchaseInvoice = await PurchaseInvoice.findByPk(
              +purchaseInvoiceDetail.purchase_invoice.id,
              {
                include: [
                  {
                    association: 'purchase_invoice_details',
                    where: { remaining_quantity: { [Op.gt]: 0 } },
                    required: true,
                  },
                ],
                transaction,
              },
            );

            if (!purchaseInvoice) {
              await PurchaseInvoice.update(
                { status: PurchaseInvoiceStatus.COMPLETED },
                {
                  where: { id: +purchaseInvoiceDetail.purchase_invoice.id },
                  transaction: transaction,
                },
              );
            }
          }

          // create journal, will develop soon
        } else if (
          purchaseReturn.destination === PurchaseReturnDestination.GOODS_RECEIPT
        ) {
          const goodsReceiptDetail = await GoodsReceiptDetail.findByPk(
            +purchaseReturnDetail.purchaseable_id,
            { include: [{ association: 'goods_receipt' }], transaction },
          );

          if (!goodsReceiptDetail) {
            return this.response.fail('goods receipt detail not found', 404);
          }

          // create balance in, will develop later
          if (purchaseReturn.type === PurchaseReturnType.RETURN) {
            await this.inventoryTransactionService.transactionOut(
              {
                product_id: goodsReceiptDetail.product_id,
                warehouse_id: goodsReceiptDetail.goods_receipt.warehouse_id,
                quantity: purchaseReturnDetail.quantity,
                outable_id: purchaseReturnDetail.id,
                outable_type: PurchaseReturnDetail.name,
                date: purchaseReturn.date,
              },
              transaction,
            );
          }

          // create journal, will develop soon
        }
      }
      await purchaseReturn.update(
        { status: PurchaseReturnStatus.COMPLETE },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        purchaseReturn,
        200,
        'Successfully set status as completed',
      );
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }
}
