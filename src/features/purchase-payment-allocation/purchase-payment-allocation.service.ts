import { Injectable } from '@nestjs/common';
import { CreatePurchasePaymentAllocationDto } from './dto/create-purchase-payment-allocation.dto';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import PurchaseInvoiceStatus from '../purchase-invoice/enum/purchase-invoice-status.enum';
import { PurchasePayment } from '../purchase-payment/entities/purchase-payment.entity';
import { PurchasePaymentAllocation } from './entities/purchase-payment-allocation.entity';
import PurchasePaymentStatus from '../purchase-payment/enum/purchase-payment-status.enum';

@Injectable()
export class PurchasePaymentAllocationService {
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

  async create(
    purchasePaymentId: number,
    createPurchasePaymentAllocationDto: CreatePurchasePaymentAllocationDto,
  ) {
    const purchasePaymentAllocation =
      await this.purchasePaymentAllocationModel.findOne({
        where: {
          purchase_invoice_id:
            createPurchasePaymentAllocationDto.purchase_invoice_id,
          purchase_payment_id: purchasePaymentId,
        },
      });

    if (purchasePaymentAllocation) {
      return this.response.fail(
        'Purchase invoice already exists, please using update instead create',
        400,
      );
    }

    const purchasePayment =
      await this.purchasePaymentModel.findByPk(+purchasePaymentId);
    if (!purchasePayment) {
      return this.response.fail('Purchase payment not found', 404);
    }

    await this.purchasePaymentValidation(
      purchasePayment,
      createPurchasePaymentAllocationDto,
    );

    const transaction = await this.sequelize.transaction();
    try {
      const purchasePaymentAllocation =
        await this.purchasePaymentAllocationModel.create(
          {
            ...createPurchasePaymentAllocationDto,
            purchase_payment_id: purchasePaymentId,
          },
          { transaction: transaction },
        );

      await purchasePayment.increment('amount_paid', {
        by: +purchasePaymentAllocation.amount_allocated,
        transaction,
      });

      await transaction.commit();
      return this.response.success(
        purchasePaymentAllocation,
        200,
        'Successfully create purchase payment allocation',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        'Failed to create purchase payment allocation',
        400,
      );
    }
  }

  async update(
    purchasePaymentId: number,
    purchasePaymentAllocationId: number,
    updatePurchasePaymentAllocationDto: CreatePurchasePaymentAllocationDto,
  ) {
    const purchasePayment =
      await this.purchasePaymentModel.findByPk(purchasePaymentId);

    if (!purchasePayment) {
      return this.response.fail('Purchase payment not found', 404);
    }

    if (purchasePayment.status !== PurchasePaymentStatus.DRAFT) {
      return this.response.fail(
        'Purchase payment already approved or cancelled',
        400,
      );
    }

    const purchasePaymentAllocation =
      await this.purchasePaymentAllocationModel.findOne({
        where: {
          id: purchasePaymentAllocationId,
          purchase_payment_id: purchasePaymentId,
        },
      });

    if (!purchasePaymentAllocation) {
      return this.response.fail('Purchase payment allocation not found', 404);
    }

    if (
      purchasePaymentAllocation.purchase_invoice_id !==
      +updatePurchasePaymentAllocationDto.purchase_invoice_id
    ) {
      const purchasePaymentAllocation =
        await this.purchasePaymentAllocationModel.findOne({
          where: {
            purchase_invoice_id:
              updatePurchasePaymentAllocationDto.purchase_invoice_id,
            purchase_payment_id: purchasePaymentId,
          },
        });

      if (purchasePaymentAllocation) {
        return this.response.fail(
          'Purchase invoice already exists, please update that allocation',
          400,
        );
      }
    }

    await this.purchasePaymentValidation(
      purchasePayment,
      updatePurchasePaymentAllocationDto,
    );

    const oldAmount = purchasePaymentAllocation.amount_allocated;

    const transaction = await this.sequelize.transaction();
    try {
      await purchasePaymentAllocation.update(
        {
          ...updatePurchasePaymentAllocationDto,
        },
        { transaction: transaction },
      );

      const amountDifferent =
        +updatePurchasePaymentAllocationDto.amount_allocated - oldAmount;

      await purchasePayment.increment('amount_paid', {
        by: +amountDifferent,
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success(
        purchasePaymentAllocation,
        200,
        'Successfully update purchase payment allocation',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        'Failed to update purchase payment allocation',
        400,
      );
    }
  }

  async delete(purchasePaymentAllocationId: number) {
    const purchasePaymentAllocation =
      await this.purchasePaymentAllocationModel.findOne({
        where: { id: purchasePaymentAllocationId },
        include: [{ association: 'purchase_payment' }],
      });

    if (!purchasePaymentAllocation) {
      return this.response.fail('Purchase payment allocation not found', 404);
    }

    if (
      purchasePaymentAllocation.purchase_payment.status ===
      PurchasePaymentStatus.APPROVED
    ) {
      return this.response.fail(
        'Purchase request status already approved',
        400,
      );
    }

    try {
      await purchasePaymentAllocation.purchase_payment.decrement(
        'amount_paid',
        { by: +purchasePaymentAllocation.amount_allocated },
      );
      await purchasePaymentAllocation.destroy();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase payment allocation',
      );
    } catch (error) {
      return this.response.fail(
        'Failed to delete purchase payment allocation',
        400,
      );
    }
  }

  private async purchasePaymentValidation(
    purchasePayment: PurchasePayment,
    payload: CreatePurchasePaymentAllocationDto,
  ) {
    if (purchasePayment.status !== PurchasePaymentStatus.DRAFT) {
      return this.response.fail(
        'Purchase payment already approved or cancelled',
        400,
      );
    }

    const purchaseInvoice = await this.purchaseInvoiceModel.findByPk(
      +payload.purchase_invoice_id,
    );

    if (!purchaseInvoice) {
      return this.response.fail('Purchase invoice not found', 404);
    }

    if (purchaseInvoice.status !== PurchaseInvoiceStatus.APPROVED) {
      return this.response.fail('Purchase invoice status is not approved', 400);
    }

    if (purchaseInvoice.supplier_id !== purchasePayment.supplier_id) {
      return this.response.fail(
        'Supplier in purchase invoice is different',
        400,
      );
    }

    const getPurchasePaymentAllocation =
      await this.purchasePaymentAllocationModel.findAll({
        where: {
          purchase_invoice_id: payload.purchase_invoice_id,
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

    const remainingAmount = +purchaseInvoice.grandtotal - +calculatePaidAmount;

    if (payload.amount_allocated > remainingAmount) {
      return this.response.fail('excess payment', 400);
    }

    return true;
  }
}
