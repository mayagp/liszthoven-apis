import { Injectable } from '@nestjs/common';
import { CreatePurchasePaymentDto } from './dto/create-purchase-payment.dto';
import { UpdatePurchasePaymentDto } from './dto/update-purchase-payment.dto';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseInvoiceDetail } from '../purchase-invoice-detail/entities/purchase-invoice-detail.entity';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import PurchaseInvoiceStatus from '../purchase-invoice/enum/purchase-invoice-status.enum';
import { PurchasePaymentAllocation } from '../purchase-payment-allocation/entities/purchase-payment-allocation.entity';
import { PurchasePaymentDocument } from '../purchase-payment-document/entities/purchase-payment-document.entity';
import { PurchasePayment } from './entities/purchase-payment.entity';
import { User } from '../user/entities/user.entity';
import PurchasePaymentStatus from './enum/purchase-payment-status.enum';

@Injectable()
export class PurchasePaymentService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseInvoice)
    private purchaseInvoiceModel: typeof PurchaseInvoice,
    @InjectModel(PurchasePayment)
    private purchasePaymentModel: typeof PurchasePayment,
    @InjectModel(PurchasePaymentAllocation)
    private purchasePaymentAllocationModel: typeof PurchasePaymentAllocation,
  ) {}

  async findAll(query: any) {
    try {
      const { count, data } = await new QueryBuilderHelper(
        this.purchasePaymentModel,
        query,
      )
        .load('supplier', 'created_by_user')
        .getResult();

      for (const purchasePayment of data) {
        purchasePayment.count_invoice = await PurchasePaymentAllocation.count({
          where: { purchase_payment_id: purchasePayment.id },
        });
      }

      const result = {
        count: count,
        purchase_payments: data,
      };

      return this.response.success(
        result,
        200,
        'Successfully retrieve purchase payments',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: number) {
    try {
      const purchasePayment = await this.purchasePaymentModel.findOne({
        where: { id },
        include: [
          {
            association: 'purchase_payment_allocations',
            include: [
              {
                association: 'purchase_invoice',
              },
            ],
          },
          {
            association: 'created_by_user',
          },
          {
            association: 'supplier',
          },
          {
            association: 'purchase_payment_documents',
          },
        ],
      });

      return this.response.success(
        purchasePayment,
        200,
        'Successfully get purchase payment',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createPurchasePaymentDto: CreatePurchasePaymentDto, user: User) {
    await user.reload({
      include: [
        {
          association: 'staff',
          include: [{ association: 'branch' }],
        },
      ],
    });

    // only 1 branch allowed
    const purchaseInvoiceIds =
      createPurchasePaymentDto.purchase_payment_allocations.map(
        (value) => value.purchase_invoice_id,
      );
    const purchaseInvoices = await this.purchaseInvoiceModel.findAll({
      where: { id: { [Op.in]: purchaseInvoiceIds } },
      group: ['branch_id'],
    });

    if (purchaseInvoices.length > 1) {
      return this.response.fail('Only invoice from 1 branch allowed', 400);
    }

    for (const purchasePaymentAllocation of createPurchasePaymentDto.purchase_payment_allocations) {
      const purchaseInvoice = await this.purchaseInvoiceModel.findByPk(
        +purchasePaymentAllocation.purchase_invoice_id,
      );
      if (!purchaseInvoice) {
        return this.response.fail('Purchase Invoice not found', 404);
      }

      if (purchaseInvoice.status !== PurchaseInvoiceStatus.APPROVED) {
        return this.response.fail(
          'Purchase invoice status is not approved',
          400,
        );
      }

      const ADMIN_ROLE_IDS = [3, 4];

      const isAdmin = ADMIN_ROLE_IDS.includes(user.staff.role);
      const isSameBranch = user.staff.branch?.id === purchaseInvoice.branch_id;

      if (!isAdmin && !isSameBranch) {
        return this.response.fail(
          'Current user is not allowed to create purchase payment for this branch',
          400,
        );
      }

      const getPurchasePaymentAllocation =
        await this.purchasePaymentAllocationModel.findAll({
          where: {
            purchase_invoice_id: purchasePaymentAllocation.purchase_invoice_id,
          },
          include: [
            {
              association: 'purchase_payment',
              where: { status: PurchasePaymentStatus.APPROVED },
            },
          ],
        });

      const calculatePaidAmount = getPurchasePaymentAllocation.reduce(
        (x, value) => x + +value.amount_allocated,
        0,
      );

      const remainingAmount =
        +purchaseInvoice.grandtotal - +calculatePaidAmount;

      if (purchasePaymentAllocation.amount_allocated > remainingAmount) {
        return this.response.fail('excess payment', 400);
      }

      if (
        purchaseInvoice.supplier_id !== createPurchasePaymentDto.supplier_id
      ) {
        return this.response.fail(
          'Supplier in purchase invoice is different',
          400,
        );
      }
    }

    const transaction = await this.sequelize.transaction();
    try {
      const amountPaid =
        createPurchasePaymentDto.purchase_payment_allocations.reduce(
          (x, value) => x + +value.amount_allocated,
          0,
        );

      const purchasePayment = await this.purchasePaymentModel.create(
        {
          ...createPurchasePaymentDto,
          created_by: user.id,
          amount_paid: amountPaid,
        },
        {
          include: [
            {
              association: 'purchase_payment_allocations',
            },
          ],
          transaction: transaction,
        },
      );

      await transaction.commit();
      return this.response.success(
        purchasePayment,
        200,
        'Successfully create purchase payment',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create purchase payment', 400);
    }
  }

  async update(id: number, updatePurchasePaymentDto: UpdatePurchasePaymentDto) {
    const purchasePayment = await this.purchasePaymentModel.findByPk(id);
    if (!purchasePayment) {
      return this.response.fail('Purchase Payment not found', 404);
    }
    const transaction = await this.sequelize.transaction();
    try {
      await purchasePayment.update(
        {
          ...updatePurchasePaymentDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();

      await purchasePayment.reload({
        include: [
          {
            association: 'supplier',
          },
        ],
      });
      return this.response.success(
        purchasePayment,
        200,
        'Successfully update purchase payment',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update purchase payment', 400);
    }
  }

  async delete(id: number) {
    const purchasePayment = await this.purchasePaymentModel.findOne({
      where: { id: id },
      include: [{ association: 'purchase_payment_allocations' }],
    });
    if (!purchasePayment) {
      return this.response.fail('Purchase Payment not found', 404);
    }

    if (purchasePayment.status === PurchasePaymentStatus.APPROVED) {
      return this.response.fail(
        'Purchase request status already approved',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      const purchaseRequestDetailIds =
        purchasePayment.purchase_payment_allocations.map((value) => +value.id);

      await this.purchasePaymentAllocationModel.destroy({
        where: { id: { [Op.in]: purchaseRequestDetailIds } },
        transaction,
      });

      await PurchasePaymentDocument.destroy({
        where: { purchase_payment_id: id },
        transaction,
      });

      await purchasePayment.destroy({ force: true, transaction });
      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase payment',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to delete purchase payment', 400);
    }
  }

  async setStatusAsApproved(id: number, user: User) {
    const purchasePayment = await this.purchasePaymentModel.findOne({
      where: { id: id },
    });
    if (!purchasePayment) {
      return this.response.fail('Purchase Payment not found', 404);
    }

    if (purchasePayment.status !== PurchasePaymentStatus.DRAFT) {
      return this.response.fail('Purchase payment status is not draft', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      const purchasePaymentAllocations =
        await this.purchasePaymentAllocationModel.findAll({
          where: { purchase_payment_id: id },
          include: [{ association: 'purchase_invoice' }],
        });

      for (const purchasePaymentAllocation of purchasePaymentAllocations) {
        await purchasePaymentAllocation.purchase_invoice.decrement(
          'remaining_amount',
          { by: purchasePaymentAllocation.amount_allocated, transaction },
        );

        const remainingAmount =
          purchasePaymentAllocation.purchase_invoice.remaining_amount -
          purchasePaymentAllocation.amount_allocated;
        if (remainingAmount <= 0) {
          const remainingItems = await PurchaseInvoiceDetail.sum(
            'remaining_quantity',
            {
              where: {
                purchase_invoice_id:
                  purchasePaymentAllocation.purchase_invoice_id,
              },
              transaction,
            },
          );

          if (remainingItems <= 0) {
            await purchasePaymentAllocation.purchase_invoice.update(
              {
                status: PurchaseInvoiceStatus.COMPLETED,
              },
              { transaction: transaction },
            );
          }
        }
      }

      await purchasePayment.update(
        {
          status: PurchasePaymentStatus.APPROVED,
        },
        { transaction: transaction },
      );

      await purchasePaymentAllocations[0].reload({
        include: [{ association: 'purchase_invoice' }],
      });
      const branchId = purchasePaymentAllocations[0].purchase_invoice.branch_id;
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to set status as approved', 400);
    }
  }

  async setStatusAsCancelled(id: number) {
    const purchasePayment = await this.purchasePaymentModel.findOne({
      where: { id: id },
    });
    if (!purchasePayment) {
      return this.response.fail('Purchase Payment not found', 404);
    }

    if (purchasePayment.status === PurchasePaymentStatus.APPROVED) {
      return this.response.fail('Purchase request already approved', 400);
    }

    try {
      await purchasePayment.update({
        status: PurchasePaymentStatus.CANCELLED,
      });
      return this.response.success(
        purchasePayment,
        200,
        'Successfully set status as cancelled',
      );
    } catch (error) {
      return this.response.fail('Failed to set status as cancelled', 400);
    }
  }
}
