import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import PurchaseInvoiceStatus from '../purchase-invoice/enum/purchase-invoice-status.enum';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { PurchaseInvoiceDetail } from './entities/purchase-invoice-detail.entity';
import { Sequelize } from 'sequelize-typescript';
import { CreatePurchaseInvoiceDetailDto } from './dto/create-purchase-invoice-detail.dto';

@Injectable()
export class PurchaseInvoiceDetailService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseInvoice)
    private purchaseInvoiceModel: typeof PurchaseInvoice,
    @InjectModel(PurchaseInvoiceDetail)
    private purchaseInvoiceDetailModel: typeof PurchaseInvoiceDetail,
    @InjectModel(PurchaseOrderDetail)
    private purchaseOrderDetailModel: typeof PurchaseOrderDetail,
  ) {}

  async create(
    purchaseInvoiceId: number,
    createPurchaseInvoiceDetailDto: CreatePurchaseInvoiceDetailDto,
  ) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
      where: { id: purchaseInvoiceId },
      include: [
        {
          association: 'purchase_invoice_details',
        },
      ],
    });

    if (purchaseInvoice?.status !== PurchaseInvoiceStatus.PENDING) {
      return this.response.fail('Purchase invoice already in progress', 400);
    }

    const isProductExists = purchaseInvoice.purchase_invoice_details.find(
      (value) =>
        +value.product_id === +createPurchaseInvoiceDetailDto.product_id,
    );

    if (isProductExists) {
      return this.response.fail(
        'Product already exists, please use update instead create',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      if (purchaseInvoice.purchase_order_id !== null) {
        let purchaseOrderDetail = await this.purchaseOrderDetailModel.findOne({
          where: {
            product_id: createPurchaseInvoiceDetailDto.product_id,
            purchase_order_id: purchaseInvoice.purchase_order_id,
          },
        });

        if (!purchaseOrderDetail) {
          const total =
            createPurchaseInvoiceDetailDto.quantity *
            createPurchaseInvoiceDetailDto.unit_price;
          purchaseOrderDetail = await this.purchaseOrderDetailModel.create(
            {
              purchase_order_id: purchaseInvoice.purchase_order_id,
              product_id: createPurchaseInvoiceDetailDto.product_id,
              quantity_ordered: createPurchaseInvoiceDetailDto.quantity,
              remaining_quantity: createPurchaseInvoiceDetailDto.quantity,
              price_per_unit: createPurchaseInvoiceDetailDto.unit_price,
              total: total,
            },
            { transaction: transaction },
          );

          await purchaseOrderDetail.reload({
            include: [{ association: 'purchase_order' }],
          });

          await purchaseOrderDetail.purchase_order.update(
            {
              subtotal: +purchaseOrderDetail.purchase_order.subtotal + +total,
              grandtotal:
                +purchaseOrderDetail.purchase_order.grandtotal + +total,
            },
            { transaction: transaction },
          );
        }

        if (
          createPurchaseInvoiceDetailDto.quantity >
          purchaseOrderDetail.remaining_quantity
        ) {
          return this.response.fail(
            'Purchase invoice quantity is not valid, please check purchase order',
            400,
          );
        }
      }

      createPurchaseInvoiceDetailDto.remaining_quantity =
        createPurchaseInvoiceDetailDto.quantity;
      createPurchaseInvoiceDetailDto.subtotal =
        +createPurchaseInvoiceDetailDto.quantity *
        +createPurchaseInvoiceDetailDto.unit_price;

      await purchaseInvoice.update(
        {
          subtotal:
            +purchaseInvoice.subtotal +
            +createPurchaseInvoiceDetailDto.subtotal,
          grandtotal:
            +purchaseInvoice.grandtotal +
            +createPurchaseInvoiceDetailDto.subtotal,
          remaining_amount:
            +purchaseInvoice.grandtotal +
            +createPurchaseInvoiceDetailDto.subtotal,
        },
        { transaction: transaction },
      );

      const purchaseInvoiceDetail =
        await this.purchaseInvoiceDetailModel.create(
          {
            ...createPurchaseInvoiceDetailDto,
            purchase_invoice_id: purchaseInvoiceId,
          },
          { transaction: transaction },
        );

      if (purchaseInvoice.purchase_order_id !== null) {
        // move qty from order to invoice
        await this.purchaseOrderDetailModel.decrement('remaining_quantity', {
          by: createPurchaseInvoiceDetailDto.quantity,
          where: {
            product_id: createPurchaseInvoiceDetailDto.product_id,
            purchase_order_id: purchaseInvoice.purchase_order_id,
          },
          transaction: transaction,
        });
      }

      await transaction.commit();
      return this.response.success(
        purchaseInvoiceDetail,
        200,
        'Successfully create purchase invoice detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(
    purchaseInvoiceId: number,
    purchaseInvoiceDetailId: number,
    updatePurchaseInvoiceDetailDto: CreatePurchaseInvoiceDetailDto,
  ) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
      where: { id: purchaseInvoiceId },
    });

    if (!purchaseInvoice) {
      return this.response.fail('Purchase invoice not found', 404);
    }

    if (purchaseInvoice.status !== PurchaseInvoiceStatus.PENDING) {
      return this.response.fail('Purchase invoice already in progress', 400);
    }

    const purchaseInvoiceDetail = await this.purchaseInvoiceDetailModel.findOne(
      {
        where: {
          id: purchaseInvoiceDetailId,
          purchase_invoice_id: purchaseInvoiceId,
        },
      },
    );

    if (!purchaseInvoiceDetail) {
      return this.response.fail('Purchase invoice detail not found', 404);
    }

    let purchaseOrderDetail: PurchaseOrderDetail | null = null;

    if (purchaseInvoice.purchase_order_id !== null) {
      purchaseOrderDetail = await this.purchaseOrderDetailModel.findOne({
        where: {
          product_id: purchaseInvoiceDetail.product_id,
          purchase_order_id: purchaseInvoice.purchase_order_id,
        },
      });

      if (purchaseOrderDetail) {
        const allowedQty =
          purchaseOrderDetail.remaining_quantity +
          purchaseInvoiceDetail.quantity;

        if (updatePurchaseInvoiceDetailDto.quantity > allowedQty) {
          return this.response.fail(
            'Purchase invoice quantity is not valid, please check purchase order',
            400,
          );
        }
      }
    }

    if (
      +purchaseInvoiceDetail.product_id !==
      +updatePurchaseInvoiceDetailDto.product_id
    ) {
      const checkInvoiceProduct = await this.purchaseInvoiceDetailModel.findOne(
        {
          where: {
            purchase_invoice_id: purchaseInvoiceId,
            product_id: +updatePurchaseInvoiceDetailDto.product_id,
          },
        },
      );

      if (checkInvoiceProduct) {
        return this.response.fail(
          'Product already exists in this invoice',
          400,
        );
      }
    }

    const transaction = await this.sequelize.transaction();
    try {
      if (purchaseInvoice.purchase_order_id !== null) {
        const isProductSame =
          +purchaseInvoiceDetail.product_id ===
          +updatePurchaseInvoiceDetailDto.product_id;

        const isQtyDifferent =
          purchaseInvoiceDetail.quantity !==
          updatePurchaseInvoiceDetailDto.quantity;

        if (isProductSame && isQtyDifferent) {
          const qtyDiff =
            updatePurchaseInvoiceDetailDto.quantity -
            purchaseInvoiceDetail.quantity;

          await this.purchaseOrderDetailModel.decrement('remaining_quantity', {
            by: qtyDiff,
            where: {
              product_id: updatePurchaseInvoiceDetailDto.product_id,
              purchase_order_id: purchaseInvoice.purchase_order_id,
            },
            transaction,
          });
        } else if (!isProductSame) {
          if (
            !purchaseOrderDetail &&
            updatePurchaseInvoiceDetailDto.update_order
          ) {
            const total =
              updatePurchaseInvoiceDetailDto.quantity *
              updatePurchaseInvoiceDetailDto.unit_price;

            purchaseOrderDetail = await this.purchaseOrderDetailModel.create(
              {
                purchase_order_id: purchaseInvoice.purchase_order_id,
                product_id: updatePurchaseInvoiceDetailDto.product_id,
                quantity_ordered: updatePurchaseInvoiceDetailDto.quantity,
                remaining_quantity: 0,
                price_per_unit: updatePurchaseInvoiceDetailDto.unit_price,
                total: total,
              },
              { transaction },
            );

            // Fetch purchase order for subtotal update
            const purchaseOrder = await PurchaseOrder.findByPk(
              purchaseInvoice.purchase_order_id,
              { transaction },
            );

            if (purchaseOrder) {
              await purchaseOrder.update(
                {
                  subtotal: +purchaseOrder.subtotal + +total,
                  grandtotal: +purchaseOrder.grandtotal + +total,
                },
                { transaction },
              );
            }
          } else if (
            purchaseOrderDetail &&
            +updatePurchaseInvoiceDetailDto.quantity !==
              +purchaseInvoiceDetail.quantity
          ) {
            await purchaseOrderDetail.increment('remaining_quantity', {
              by: purchaseInvoiceDetail.quantity,
              transaction,
            });

            const newOrderDetail = await this.purchaseOrderDetailModel.findOne({
              where: {
                product_id: updatePurchaseInvoiceDetailDto.product_id,
                purchase_order_id: purchaseInvoice.purchase_order_id,
              },
              transaction,
            });

            if (
              !newOrderDetail &&
              updatePurchaseInvoiceDetailDto.update_order
            ) {
              const total =
                updatePurchaseInvoiceDetailDto.quantity *
                updatePurchaseInvoiceDetailDto.unit_price;

              purchaseOrderDetail = await this.purchaseOrderDetailModel.create(
                {
                  purchase_order_id: purchaseInvoice.purchase_order_id,
                  product_id: updatePurchaseInvoiceDetailDto.product_id,
                  quantity_ordered: updatePurchaseInvoiceDetailDto.quantity,
                  remaining_quantity: 0,
                  price_per_unit: updatePurchaseInvoiceDetailDto.unit_price,
                  total: total,
                },
                { transaction },
              );

              const purchaseOrder = await PurchaseOrder.findByPk(
                purchaseInvoice.purchase_order_id,
                { transaction },
              );

              if (purchaseOrder) {
                await purchaseOrder.update(
                  {
                    subtotal: +purchaseOrder.subtotal + +total,
                    grandtotal: +purchaseOrder.grandtotal + +total,
                  },
                  { transaction },
                );
              }
            }
          }
        }
      }

      const oldTotal = +purchaseInvoiceDetail.subtotal;
      const newTotal =
        +updatePurchaseInvoiceDetailDto.unit_price *
        updatePurchaseInvoiceDetailDto.quantity;

      await purchaseInvoiceDetail.update(
        {
          ...updatePurchaseInvoiceDetailDto,
          subtotal: newTotal,
        },
        { transaction },
      );

      const grandTotal = +purchaseInvoice.grandtotal + (newTotal - oldTotal);
      const subTotal = +purchaseInvoice.subtotal + (newTotal - oldTotal);

      await purchaseInvoice.update(
        {
          grandtotal: grandTotal,
          remaining_amount: grandTotal,
          subtotal: subTotal,
        },
        { transaction },
      );

      await transaction.commit();
      return this.response.success(
        purchaseInvoiceDetail,
        200,
        'Successfully update purchase invoice detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        'Failed to update purchase invoice detail',
        400,
      );
    }
  }

  async delete(purchaseInvoiceId: number, purchaseInvoiceDetailId: number) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
      where: { id: purchaseInvoiceId },
    });

    if (!purchaseInvoice) {
      return this.response.fail('Purchase invoice not found', 404);
    }

    if (purchaseInvoice.status !== PurchaseInvoiceStatus.PENDING) {
      return this.response.fail('Purchase invoice already in progress', 400);
    }

    const purchaseInvoiceDetail = await this.purchaseInvoiceDetailModel.findOne(
      {
        where: {
          id: purchaseInvoiceDetailId,
          purchase_invoice_id: purchaseInvoiceId,
        },
      },
    );

    if (!purchaseInvoiceDetail) {
      return this.response.fail('Purchase invoice detail not found', 404);
    }

    try {
      const newSubtotal =
        +purchaseInvoice.subtotal - +purchaseInvoiceDetail.subtotal;
      const newGrandTotal =
        +purchaseInvoice.grandtotal - +purchaseInvoiceDetail.subtotal;

      // update invoice totals
      await purchaseInvoice.update({
        grandtotal: newGrandTotal,
        remaining_amount: newGrandTotal,
        subtotal: newSubtotal,
      });

      if (purchaseInvoice.purchase_order_id !== null) {
        await this.purchaseOrderDetailModel.increment('remaining_quantity', {
          by: purchaseInvoiceDetail.quantity,
          where: {
            product_id: purchaseInvoiceDetail.product_id,
            purchase_order_id: purchaseInvoice.purchase_order_id,
          },
        });
      }

      // force delete detail
      await purchaseInvoiceDetail.destroy({ force: true });

      return this.response.success(
        {},
        200,
        'Successfully deleted purchase invoice detail',
      );
    } catch (error) {
      return this.response.fail(
        'Failed to delete purchase invoice detail',
        400,
      );
    }
  }
}
