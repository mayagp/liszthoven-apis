import { Injectable } from '@nestjs/common';
import { CreatePurchaseOrderDetailDto } from './dto/create-purchase-order-detail.dto';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import PurchaseOrderStatus from '../purchase-order/enum/purchase-order-status.enum';
import { PurchaseOrderDetail } from './entities/purchase-order-detail.entity';

@Injectable()
export class PurchaseOrderDetailService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseOrder)
    private purchaseOrderModel: typeof PurchaseOrder,
    @InjectModel(PurchaseOrderDetail)
    private purchaseOrderDetailModel: typeof PurchaseOrderDetail,
  ) {}

  async create(
    purchaseOrderId: number,
    createPurchaseOrderDetailDto: CreatePurchaseOrderDetailDto,
  ) {
    const purchaseOrder = await this.purchaseOrderModel.findOne({
      where: { id: purchaseOrderId },
      include: [
        {
          association: 'purchase_order_details',
          include: [
            {
              association: 'product',
              include: [
                {
                  association: 'product_images',
                },
              ],
            },
          ],
        },
      ],
    });

    if (purchaseOrder?.status !== PurchaseOrderStatus.PENDING) {
      return this.response.fail('Purchase order already in progress', 400);
    }

    const isProductExists = purchaseOrder.purchase_order_details.find(
      (value) => +value.product_id === +createPurchaseOrderDetailDto.product_id,
    );

    if (isProductExists) {
      return this.response.fail(
        'Product already exists, please use update instead create',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      // calculate order detail total
      createPurchaseOrderDetailDto.total =
        +createPurchaseOrderDetailDto.price_per_unit *
        createPurchaseOrderDetailDto.quantity_ordered;

      createPurchaseOrderDetailDto.remaining_quantity =
        createPurchaseOrderDetailDto.quantity_ordered;

      // Update purchase order subtotal and grandtotal
      await purchaseOrder.update(
        {
          subtotal:
            +purchaseOrder.subtotal + +createPurchaseOrderDetailDto.total,
          grandtotal:
            +purchaseOrder.grandtotal + +createPurchaseOrderDetailDto.total,
        },
        { transaction: transaction },
      );

      const purchaseOrderDetail = await this.purchaseOrderDetailModel.create(
        {
          ...createPurchaseOrderDetailDto,
          purchase_order_id: purchaseOrderId,
        },
        { transaction: transaction },
      );

      await transaction.commit();

      await purchaseOrderDetail.reload({
        include: [
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
          {
            association: 'supplier_quotation',
          },
        ],
      });
      return this.response.success(
        purchaseOrderDetail,
        200,
        'Successfully create purchase order detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create purchase order detail', 400);
    }
  }

  async update(
    purchaseOrderId: number,
    purchaseOrderDetailId: number,
    updatePurchaseOrderDetailDto: CreatePurchaseOrderDetailDto,
  ) {
    const purchaseOrder = await this.purchaseOrderModel.findOne({
      where: { id: purchaseOrderId },
    });

    if (purchaseOrder?.status !== PurchaseOrderStatus.PENDING) {
      return this.response.fail('Purchase order already in progress', 400);
    }

    const purchaseOrderDetail = await this.purchaseOrderDetailModel.findOne({
      where: {
        id: purchaseOrderDetailId,
        purchase_order_id: purchaseOrderId,
      },
    });

    if (!purchaseOrderDetail) {
      return this.response.fail('Purchase Order Detail not found', 404);
    }

    const transaction = await this.sequelize.transaction();
    try {
      // recalculate purchase order detail
      const newTotal =
        +updatePurchaseOrderDetailDto.price_per_unit *
        updatePurchaseOrderDetailDto.quantity_ordered;

      const grandTotal = +purchaseOrder.grandtotal - +purchaseOrderDetail.total;
      const subTotal = +purchaseOrder.subtotal - +purchaseOrderDetail.total;

      await purchaseOrderDetail.update(
        {
          ...updatePurchaseOrderDetailDto,
          total: newTotal,
        },
        { transaction: transaction },
      );

      await purchaseOrder.update(
        {
          grandtotal: grandTotal + newTotal,
          subtotal: subTotal + newTotal,
        },
        { transaction: transaction },
      );
      await transaction.commit();

      await purchaseOrderDetail.reload({
        include: [
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
          {
            association: 'supplier_quotation',
          },
        ],
      });
      return this.response.success(
        purchaseOrderDetail,
        200,
        'Successfully update purchase order detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update purchase order detail', 400);
    }
  }

  async delete(purchaseOrderId: number, purchaseOrderDetailId: number) {
    const purchaseOrder = await this.purchaseOrderModel.findOne({
      where: { id: purchaseOrderId },
    });

    if (purchaseOrder?.status !== PurchaseOrderStatus.PENDING) {
      return this.response.fail('Purchase order already in progress', 400);
    }

    const purchaseOrderDetail = await this.purchaseOrderDetailModel.findOne({
      where: {
        id: purchaseOrderDetailId,
        purchase_order_id: purchaseOrderId,
      },
    });
    if (!purchaseOrderDetail) {
      return this.response.fail('Purchase Order Detail not found', 404);
    }

    try {
      // recalculate purchase order
      await purchaseOrder.update({
        grandtotal: +purchaseOrder.grandtotal - +purchaseOrderDetail.total,
        subtotal: +purchaseOrder.subtotal - +purchaseOrderDetail.total,
      });

      // force delete purchase order detail
      await purchaseOrderDetail.destroy({ force: true });
      return this.response.success(
        {},
        200,
        'Successfully delete purchase order',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
