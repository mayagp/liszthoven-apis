import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { GoodsReceipt } from '../goods-receipt/entities/goods-receipt.entity';
import GoodsReceiptStatusEnum from '../goods-receipt/enum/goods-receipt-status.enum';
import { Product } from '../product/entities/product.entity';
import ProductTypeEnum from '../product/enum/product-type.enum';
import PurchaseInvoiceStatus from '../purchase-invoice/enum/purchase-invoice-status.enum';
import { GoodsReceiptDetailDto } from './dto/goods-receipt-detail.dto';
import { GoodsReceiptDetail } from './entities/goods-receipt-detail.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class GoodsReceiptDetailService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(GoodsReceipt)
    private goodsReceiptModel: typeof GoodsReceipt,
    @InjectModel(GoodsReceiptDetail)
    private goodsReceiptDetailModel: typeof GoodsReceiptDetail,
  ) {}

  async create(
    goodsReceiptId: number,
    goodsReceiptDetailDto: GoodsReceiptDetailDto,
  ) {
    const goodsReceipt = await this.goodsReceiptModel.findByPk(goodsReceiptId, {
      include: [
        {
          association: 'purchase_invoice',
          include: [{ association: 'purchase_invoice_details' }],
        },
        {
          association: 'goods_receipt_details',
        },
      ],
    });

    if (goodsReceipt?.status !== GoodsReceiptStatusEnum.DRAFT) {
      return this.response.fail(
        'Goods receipt already completed or cancelled',
        400,
      );
    }

    const isProductExists = goodsReceipt.goods_receipt_details.find(
      (value) => +value.product_id === +goodsReceiptDetailDto.product_id,
    );

    if (isProductExists) {
      return this.response.fail(
        'Product already exists in goods receipt, please using update instead create',
        400,
      );
    }

    const purchaseInvoice = goodsReceipt.purchase_invoice;

    // check PI status
    if (purchaseInvoice.status !== PurchaseInvoiceStatus.APPROVED) {
      return this.response.fail('Purchase invoice status is not approved', 400);
    }

    // is product exists in invoice detail?
    const invoiceDetail = purchaseInvoice.purchase_invoice_details.find(
      (value) => +value.product_id === goodsReceiptDetailDto.product_id,
    );

    if (!invoiceDetail) {
      return this.response.fail(
        'Product doesnt exists in purchase invoice',
        400,
      );
    }

    // purchase invoice quantity valid?
    if (+goodsReceiptDetailDto.quantity > invoiceDetail.remaining_quantity) {
      return this.response.fail(
        'Insufficient quantity (purchase invoice)',
        400,
      );
    }

    const product = await Product.findOne({
      where: { id: goodsReceiptDetailDto.product_id },
    });

    if (!product) {
      return this.response.fail('Product not found', 404);
    }
    // check quantity of serial number must equal to good receipt detail quantity
    if (product.type === ProductTypeEnum.SERIALIZED) {
      if (typeof goodsReceiptDetailDto.gr_serial_numbers === 'undefined') {
        return this.response.fail('Serial numbers is required', 400);
      }
      if (
        goodsReceiptDetailDto.gr_serial_numbers.length !==
        goodsReceiptDetailDto.quantity
      ) {
        return this.response.fail(
          'Serial numbers length must be equal to quantity',
          400,
        );
      }
    }

    const transaction = await this.sequelize.transaction();
    try {
      const goodsReceiptDetail = await this.goodsReceiptDetailModel.create(
        {
          goods_receipt_id: goodsReceiptId,
          ...goodsReceiptDetailDto,
        },
        {
          include: [{ association: 'gr_serial_numbers' }],
          transaction: transaction,
        },
      );

      await transaction.commit();

      await goodsReceiptDetail.reload({
        include: [
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
        ],
      });

      return this.response.success(
        goodsReceiptDetail,
        200,
        'Successfully create goods receipt detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create goods receipt detail', 400);
    }
  }

  async update(
    goodsReceiptId: number,
    detailId: number,
    goodsReceiptDetailDto: GoodsReceiptDetailDto,
  ) {
    const goodsReceipt = await this.goodsReceiptModel.findOne({
      where: { id: goodsReceiptId },
      include: [
        { association: 'goods_receipt_details' },
        {
          association: 'purchase_invoice',
          include: [{ association: 'purchase_invoice_details' }],
        },
      ],
    });

    if (goodsReceipt?.status !== GoodsReceiptStatusEnum.DRAFT) {
      return this.response.fail(
        'Goods receipt already completed or cancelled',
        400,
      );
    }

    const isProductExists = goodsReceipt.goods_receipt_details.find(
      (value) =>
        value.id !== detailId &&
        value.product_id === goodsReceiptDetailDto.product_id,
    );

    if (isProductExists) {
      return this.response.fail('Product already exists in goods receipt', 400);
    }

    const purchaseInvoice = goodsReceipt.purchase_invoice;

    // check PI status
    if (purchaseInvoice.status !== PurchaseInvoiceStatus.APPROVED) {
      return this.response.fail('Purchase invoice status is not approved', 400);
    }

    // is product exists in invoice detail?
    const invoiceDetail = purchaseInvoice.purchase_invoice_details.find(
      (value) => +value.product_id === goodsReceiptDetailDto.product_id,
    );

    if (!invoiceDetail) {
      return this.response.fail(
        'Product doesnt exists in purchase invoice',
        400,
      );
    }

    // purchase invoice quantity valid?
    if (+goodsReceiptDetailDto.quantity > invoiceDetail.remaining_quantity) {
      return this.response.fail(
        'Insufficient quantity (purchase invoice)',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      const goodsReceiptDetail = goodsReceipt.goods_receipt_details.find(
        (value) => value.id === detailId,
      );

      if (!goodsReceiptDetail) {
        return this.response.fail('Goods receipt detail not found', 404);
      }

      await goodsReceiptDetail.update(
        {
          ...goodsReceiptDetailDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();

      await goodsReceiptDetail.reload({
        include: [
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
        ],
      });
      return this.response.success(
        goodsReceiptDetail,
        200,
        'Successfully update goods receipt detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update goods receipt detail', 400);
    }
  }

  async delete(id: number) {
    const goodsReceiptDetail = await this.goodsReceiptDetailModel.findOne({
      where: { id: id },
      include: [
        { association: 'goods_receipt' },
        { association: 'gr_serial_numbers' },
      ],
    });

    if (!goodsReceiptDetail) {
      return this.response.fail('Goods receipt detail not found', 404);
    }

    if (
      goodsReceiptDetail.goods_receipt?.status !== GoodsReceiptStatusEnum.DRAFT
    ) {
      return this.response.fail('Goods receipts status is not draft', 400);
    }

    const transaction = await this.sequelize.transaction();

    try {
      if (goodsReceiptDetail.gr_serial_numbers.length > 0) {
        for (const serialNumber of goodsReceiptDetail.gr_serial_numbers) {
          await serialNumber.destroy({ transaction });
        }
      }

      await goodsReceiptDetail.destroy({ transaction });
      return this.response.success(
        {},
        200,
        'Successfully delete goods receipt detail',
      );
    } catch (error) {
      return this.response.fail('Failed to delete goods receipt detail', 400);
    }
  }
}
