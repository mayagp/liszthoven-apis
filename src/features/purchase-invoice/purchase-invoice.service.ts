import { Injectable } from '@nestjs/common';
import { CreatePurchaseInvoiceDto } from './dto/create-purchase-invoice.dto';
import { UpdatePurchaseInvoiceDto } from './dto/update-purchase-invoice.dto';
import { InjectModel } from '@nestjs/sequelize';
import * as currency from 'currency.js';
import { Op } from 'sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseInvoiceDetail } from '../purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import { PurchaseOrder } from '../purchase-order/entities/purchase-order.entity';
import { PurchaseInvoice } from './entities/purchase-invoice.entity';
import { Sequelize } from 'sequelize-typescript';
import { AutoNumberService } from '../auto-number/auto-number.service';
import PurchaseOrderStatus from '../purchase-order/enum/purchase-order-status.enum';
import PurchaseInvoiceStatus from './enum/purchase-invoice-status.enum';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PurchaseInvoiceService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseInvoice)
    private purchaseInvoiceModel: typeof PurchaseInvoice,
    @InjectModel(PurchaseInvoiceDetail)
    private purchaseInvoiceDetailModel: typeof PurchaseInvoiceDetail,
    @InjectModel(PurchaseOrder)
    private purchaseOrderModel: typeof PurchaseOrder,
    @InjectModel(PurchaseOrderDetail)
    private purchaseOrderDetailModel: typeof PurchaseOrderDetail,
    private autoNumberService: AutoNumberService,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.purchaseInvoiceModel,
      query,
    )
      .load('supplier.user')
      .getResult();

    const result = {
      count: count,
      purchase_invoices: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve purchase invoices',
    );
  }

  async findOne(id: number) {
    try {
      const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
        where: { id },
        include: [
          {
            association: 'purchase_invoice_details',
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
            association: 'supplier',
            include: [{ association: 'user' }],
          },
          {
            association: 'purchase_order',
          },
          {
            association: 'purchase_invoice_documents',
          },
        ],
      });
      return this.response.success(
        purchaseInvoice,
        200,
        ' Successfully get purchase invoice',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createPurchaseInvoiceDto: CreatePurchaseInvoiceDto, user: User) {
    const transaction = await this.sequelize.transaction();
    try {
      // Optional PO
      let purchaseOrder: PurchaseOrder | null = null;

      if (createPurchaseInvoiceDto?.purchase_order_id !== null) {
        purchaseOrder = await this.purchaseOrderModel.findByPk(
          createPurchaseInvoiceDto.purchase_order_id,
          { include: 'purchase_order_details' },
        );

        if (!purchaseOrder) {
          await transaction.rollback();
          return this.response.fail('Purchase order not found', 404);
        }

        if (purchaseOrder.status !== PurchaseOrderStatus.APPROVED) {
          await transaction.rollback();
          return this.response.fail(
            'Purchase order status is not approved',
            400,
          );
        }

        createPurchaseInvoiceDto.supplier_id = purchaseOrder.supplier_id;
        createPurchaseInvoiceDto.branch_id = purchaseOrder.branch_id;
      }

      let subtotal = 0;

      for (const purchaseInvoiceDetail of createPurchaseInvoiceDto.purchase_invoice_details) {
        if (purchaseOrder) {
          let purchaseOrderDetail = purchaseOrder.purchase_order_details.find(
            (data) => +data.product_id === +purchaseInvoiceDetail.product_id,
          );

          if (!purchaseOrderDetail && purchaseInvoiceDetail.update_order) {
            const total =
              purchaseInvoiceDetail.quantity * purchaseInvoiceDetail.unit_price;

            purchaseOrderDetail = await this.purchaseOrderDetailModel.create(
              {
                purchase_order_id: createPurchaseInvoiceDto.purchase_order_id,
                product_id: purchaseInvoiceDetail.product_id,
                quantity_ordered: purchaseInvoiceDetail.quantity,
                remaining_quantity: purchaseInvoiceDetail.quantity,
                price_per_unit: purchaseInvoiceDetail.unit_price,
                total: total,
              },
              { transaction },
            );

            if (
              purchaseInvoiceDetail.quantity >
              purchaseOrderDetail.remaining_quantity
            ) {
              await transaction.rollback();
              return this.response.fail(
                'Purchase invoice quantity is not valid, please check purchase order',
                400,
              );
            }

            await purchaseOrderDetail.reload({
              include: [{ association: 'purchase_order' }],
              transaction,
            });

            await purchaseOrderDetail.purchase_order.update(
              {
                subtotal: +purchaseOrderDetail.purchase_order.subtotal + +total,
                grandtotal:
                  +purchaseOrderDetail.purchase_order.grandtotal + +total,
              },
              { transaction },
            );

            await purchaseOrderDetail.decrement('remaining_quantity', {
              by: purchaseInvoiceDetail.quantity,
              transaction,
            });
          } else if (purchaseOrderDetail) {
            if (
              purchaseInvoiceDetail.quantity >
              purchaseOrderDetail.remaining_quantity
            ) {
              await transaction.rollback();
              return this.response.fail(
                'Purchase invoice quantity is not valid, please check purchase order',
                400,
              );
            }

            await purchaseOrderDetail.decrement('remaining_quantity', {
              by: purchaseInvoiceDetail.quantity,
              transaction,
            });
          }
        }

        const total =
          purchaseInvoiceDetail.quantity * +purchaseInvoiceDetail.unit_price;
        purchaseInvoiceDetail.subtotal = total;
        purchaseInvoiceDetail.remaining_quantity =
          purchaseInvoiceDetail.quantity;
        subtotal += total;
      }

      createPurchaseInvoiceDto.invoice_no =
        await this.autoNumberService.generateAutoNumber(
          PurchaseInvoice.name,
          transaction,
        );

      const grandtotal = currency(subtotal)
        .add(createPurchaseInvoiceDto.tax)
        .add(createPurchaseInvoiceDto.shipping_cost).value;

      const purchaseInvoice = await this.purchaseInvoiceModel.create(
        {
          ...createPurchaseInvoiceDto,
          status: PurchaseInvoiceStatus.PENDING,
          subtotal,
          grandtotal,
          remaining_amount: grandtotal,
          created_by: user.id,
        },
        {
          include: [
            {
              association: 'purchase_invoice_details',
              include: [
                {
                  association: 'product',
                  include: [{ association: 'product_images' }],
                },
              ],
            },
          ],
          transaction,
        },
      );

      await transaction.commit();
      return this.response.success(
        purchaseInvoice,
        200,
        'Successfully create purchase invoice',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(id: number, updatePurchaseInvoiceDto: UpdatePurchaseInvoiceDto) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
      where: { id: id },
    });

    if (purchaseInvoice?.status !== PurchaseInvoiceStatus.PENDING) {
      return this.response.fail('Purchase invoice already in progress', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      updatePurchaseInvoiceDto.grandtotal = purchaseInvoice.grandtotal;

      if (purchaseInvoice.tax !== updatePurchaseInvoiceDto.tax) {
        updatePurchaseInvoiceDto.grandtotal =
          +updatePurchaseInvoiceDto.grandtotal -
          +purchaseInvoice.tax +
          +updatePurchaseInvoiceDto.tax;
      }

      if (
        +purchaseInvoice.shipping_cost !==
        +updatePurchaseInvoiceDto.shipping_cost
      ) {
        updatePurchaseInvoiceDto.grandtotal = currency(
          updatePurchaseInvoiceDto.grandtotal,
        )
          .subtract(purchaseInvoice.shipping_cost)
          .add(updatePurchaseInvoiceDto.shipping_cost).value;
      }

      await purchaseInvoice.update(
        {
          ...updatePurchaseInvoiceDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        purchaseInvoice,
        200,
        'Successfully update purchase invoice',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update purchase invoice', 400);
    }
  }

  async delete(id: number) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
      where: { id: id },
      include: [{ association: 'purchase_invoice_details' }],
    });

    // Pastikan data ditemukan
    if (!purchaseInvoice) {
      return this.response.fail('Purchase invoice not found', 404);
    }

    // Validasi status invoice
    if (
      ![
        PurchaseInvoiceStatus.PENDING,
        PurchaseInvoiceStatus.PAYMENT_APPROVAL,
      ].includes(purchaseInvoice.status)
    ) {
      return this.response.fail('Purchase invoice already in progress', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      const purchaseInvoiceDetailIds: number[] = [];

      for (const purchaseInvoiceDetail of purchaseInvoice.purchase_invoice_details) {
        // Jika ada referensi ke purchase order, kembalikan jumlah remaining
        if (purchaseInvoice.purchase_order_id !== null) {
          await this.purchaseOrderDetailModel.increment('remaining_quantity', {
            by: purchaseInvoiceDetail.remaining_quantity,
            where: {
              purchase_order_id: purchaseInvoice.purchase_order_id,
              product_id: purchaseInvoiceDetail.product_id,
            },
            transaction,
          });
        }

        purchaseInvoiceDetailIds.push(purchaseInvoiceDetail.id);
      }

      await this.purchaseInvoiceDetailModel.destroy({
        where: { id: { [Op.in]: purchaseInvoiceDetailIds } },
        transaction,
      });

      await purchaseInvoice.destroy({ transaction });

      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase invoice',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async purchaseInvoiceApproval(id: number, user: User) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
      where: { id: id },
    });

    if (purchaseInvoice?.status !== PurchaseInvoiceStatus.PENDING) {
      return this.response.fail('Purchase invoice already in progress', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchaseInvoice.update(
        {
          status: PurchaseInvoiceStatus.PAYMENT_APPROVAL,
          approved_at: new Date(),
          approved_by: user.id,
        },
        { transaction: transaction },
      );

      await transaction.commit();
      return this.response.success(
        purchaseInvoice,
        200,
        'Successfully approve purchase invoice',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to approve purchase invoice', 400);
    }
  }

  async approvePurchaseInvoice(id: number, user: User) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
      where: { id: id },
    });

    if (purchaseInvoice?.status !== PurchaseInvoiceStatus.PAYMENT_APPROVAL) {
      return this.response.fail(
        'Purchase invoice status is not payment approval',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchaseInvoice.update(
        {
          status: PurchaseInvoiceStatus.APPROVED,
          approved_at: new Date(),
          approved_by: user.id,
        },
        { transaction: transaction },
      );

      await transaction.commit();
      return this.response.success(
        purchaseInvoice,
        200,
        'Successfully approve purchase invoice',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to approve purchase invoice', 400);
    }
  }

  async cancelPurchaseInvoice(id: number) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
      where: { id },
      include: [{ association: 'purchase_invoice_details' }],
    });

    // Cek apakah invoice ditemukan
    if (!purchaseInvoice) {
      return this.response.fail('Purchase invoice not found', 404);
    }

    // Validasi status invoice
    if (
      ![
        PurchaseInvoiceStatus.PENDING,
        PurchaseInvoiceStatus.PAYMENT_APPROVAL,
      ].includes(purchaseInvoice.status)
    ) {
      return this.response.fail('Purchase invoice already in progress', 400);
    }

    if (purchaseInvoice.status === PurchaseInvoiceStatus.CANCELLED) {
      return this.response.fail('Purchase invoice already cancelled', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchaseInvoice.update(
        {
          status: PurchaseInvoiceStatus.CANCELLED,
        },
        { transaction },
      );

      if (purchaseInvoice.purchase_order_id !== null) {
        for (const purchaseInvoiceDetail of purchaseInvoice.purchase_invoice_details) {
          await this.purchaseOrderDetailModel.increment('remaining_quantity', {
            by: purchaseInvoiceDetail.remaining_quantity,
            where: {
              purchase_order_id: purchaseInvoice.purchase_order_id,
              product_id: purchaseInvoiceDetail.product_id,
            },
            transaction,
          });
        }
      }

      await transaction.commit();
      return this.response.success(
        purchaseInvoice,
        200,
        'Successfully cancel purchase invoice',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        error.message || 'Failed to cancel purchase invoice',
        400,
      );
    }
  }
}
