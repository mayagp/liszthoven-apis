import { Injectable, Res } from '@nestjs/common';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'aws-sdk/clients/appstream';
import * as currency from 'currency.js';
import moment from 'moment';
import { PDFOptions } from 'puppeteer';
import { Op } from 'sequelize';
import { PdfHelper } from 'src/helpers/pdf.helper';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { GoodsReceiptDetail } from '../goods-receipt-detail/entities/goods-receipt-detail.entity';
import { GoodsReceiptDocument } from '../goods-receipt-document/entities/goods-receipt-document.entity';
import { Product } from '../product/entities/product.entity';
import ProductTypeEnum from '../product/enum/product-type.enum';
import { PurchaseInvoice } from '../purchase-invoice/entities/purchase-invoice.entity';
import PurchaseInvoiceStatus from '../purchase-invoice/enum/purchase-invoice-status.enum';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { Sequelize } from 'sequelize-typescript';
import { AutoNumberService } from '../auto-number/auto-number.service';
import { InventoryTransactionService } from '../inventory-transaction/inventory-transaction.service';
import GoodsReceiptStatusEnum from './enum/goods-receipt-status.enum';
import { SerializeItem } from '../serialize-item/entities/serialize-item.entity';
import { GrSerialNumber } from '../serialize-item/entities/gr-serial-number.entity';

@Injectable()
export class GoodsReceiptService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(GoodsReceipt)
    private goodsReceiptModel: typeof GoodsReceipt,
    @InjectModel(GoodsReceiptDetail)
    private goodsReceiptDetailModel: typeof GoodsReceiptDetail,
    @InjectModel(PurchaseInvoice)
    private purchaseInvoiceModel: typeof PurchaseInvoice,
    @InjectModel(PurchaseOrderDetail)
    private purchaseOrderDetailModel: typeof PurchaseOrderDetail,
    private readonly inventoryTransactionService: InventoryTransactionService,
    private autoNumbersAdminService: AutoNumberService,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.goodsReceiptModel,
      query,
    )
      .load('supplier.user', 'warehouse', 'purchase_invoice')
      .getResult();

    const result = {
      count: count,
      goods_receipts: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve goods receipts',
    );
  }

  async findOne(id: number) {
    try {
      const goodsReceipt = await this.goodsReceiptModel.findOne({
        where: { id },
        include: [
          {
            association: 'goods_receipt_details',
            include: [
              {
                association: 'product',
              },
              {
                association: 'gr_serial_numbers',
              },
            ],
          },
          {
            association: 'warehouse',
          },
          {
            association: 'supplier',
            include: [{ association: 'user' }],
          },
          {
            association: 'purchase_invoice',
          },
          {
            association: 'goods_receipt_documents',
          },
        ],
      });

      return this.response.success(
        goodsReceipt,
        200,
        'Successfully get goods receipt',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createGoodsReceiptDto: CreateGoodsReceiptDto) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findByPk(
      +createGoodsReceiptDto.purchase_invoice_id,
      {
        include: [
          {
            association: 'purchase_invoice_details',
          },
        ],
      },
    );
    if (!purchaseInvoice) {
      return this.response.fail('Purchase invoice not found', 404);
    }

    // check PI status
    if (purchaseInvoice.status !== PurchaseInvoiceStatus.APPROVED) {
      return this.response.fail('Purchase invoice status is not approved', 400);
    }

    // Goods receipt detail validation
    for (const goodsReceiptDetail of createGoodsReceiptDto.goods_receipt_details) {
      // is product exists in invoice detail?
      const invoiceDetail = purchaseInvoice.purchase_invoice_details.find(
        (value) => +value.product_id === goodsReceiptDetail.product_id,
      );

      if (!invoiceDetail) {
        return this.response.fail(
          'Product doesnt exists in purchase invoice',
          400,
        );
      }

      // purchase invoice quantity valid?
      if (goodsReceiptDetail.quantity > invoiceDetail.remaining_quantity) {
        return this.response.fail(
          'Insufficient quantity (purchase invoice)',
          400,
        );
      }

      const product = await Product.findOne({
        where: { id: goodsReceiptDetail.product_id },
      });

      if (!product) {
        return this.response.fail('Product not found', 404);
      }

      // check quantity of serial number must equal to good receipt detail quantity
      if (product.type === ProductTypeEnum.SERIALIZED) {
        if (typeof goodsReceiptDetail.gr_serial_numbers === 'undefined') {
          return this.response.fail('Serial numbers is required', 400);
        }

        if (
          goodsReceiptDetail.gr_serial_numbers.length !==
          goodsReceiptDetail.quantity
        ) {
          return this.response.fail(
            'Serial numbers length must be equal to quantity',
            400,
          );
        }

        for (const grSerialNumber of goodsReceiptDetail.gr_serial_numbers) {
          const serializeItem = await SerializeItem.findOne({
            where: { serial_code: grSerialNumber.serial_number },
          });

          if (serializeItem) {
            return this.response.fail('Serial number already exists', 400);
          }

          const checkSerialNumber = await GrSerialNumber.findOne({
            where: { serial_number: grSerialNumber.serial_number },
            include: [
              {
                association: 'goods_receipt_detail',
                required: true,
                attributes: [],
                include: [
                  {
                    association: 'goods_receipt',
                    where: {
                      status: { [Op.ne]: GoodsReceiptStatusEnum.CANCELLED },
                    },
                    required: true,
                    attributes: [],
                  },
                ],
              },
            ],
          });
          if (checkSerialNumber) {
            return this.response.fail(
              'Serial number already exists in goods receipt',
              400,
            );
          }
        }
      }
    }

    const transaction = await this.sequelize.transaction();
    try {
      createGoodsReceiptDto.goods_receipt_no =
        await this.autoNumbersAdminService.generateAutoNumber(
          GoodsReceipt.name,
          transaction,
        );

      const goodsReceipt = await this.goodsReceiptModel.create(
        {
          ...createGoodsReceiptDto,
          supplier_id: purchaseInvoice.supplier_id,
          status: GoodsReceiptStatusEnum.DRAFT,
        },
        {
          include: [
            {
              association: 'goods_receipt_details',
              include: [{ association: 'gr_serial_numbers' }],
            },
          ],
          transaction: transaction,
        },
      );

      await transaction.commit();
      return this.response.success(
        goodsReceipt,
        200,
        'Successfully create goods receipt',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create goods receipt', 400);
    }
  }

  async update(id: number, updateGoodsReceiptDto: UpdateGoodsReceiptDto) {
    const goodsReceipt = await this.goodsReceiptModel.findOne({
      where: { id: id },
    });

    if (goodsReceipt?.status !== GoodsReceiptStatusEnum.DRAFT) {
      return this.response.fail(
        'Goods receipt already completed or cancelled',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      await goodsReceipt.update(
        {
          ...updateGoodsReceiptDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        goodsReceipt,
        200,
        'Successfully update goods receipt',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update goods receipt', 400);
    }
  }

  async delete(id: number) {
    const goodsReceipt = await this.goodsReceiptModel.findOne({
      where: { id: id },
      include: [{ association: 'goods_receipt_details' }],
    });

    if (goodsReceipt?.status !== GoodsReceiptStatusEnum.DRAFT) {
      return this.response.fail('Goods receipts status is not draft', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      const goodsReceiptDetailId = goodsReceipt.goods_receipt_details.map(
        (value) => value.id,
      );

      await GrSerialNumber.destroy({
        where: { goods_receipt_detail_id: { [Op.in]: goodsReceiptDetailId } },
        transaction,
      });

      await this.goodsReceiptDetailModel.destroy({
        where: { id: { [Op.in]: goodsReceiptDetailId }, goods_receipt_id: id },
        transaction,
      });

      await GoodsReceiptDocument.destroy({
        where: { goods_receipt_id: id },
        transaction,
      });

      await goodsReceipt.destroy({ transaction });

      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete goods receipt',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }

  async goodsReceiptComplete(id: number, user: User) {
    const goodsReceipt = await this.goodsReceiptModel.findOne({
      where: { id: id },
      include: [
        {
          association: 'goods_receipt_details',
          include: ['gr_serial_numbers'],
        },
        {
          association: 'purchase_invoice',
          include: [{ association: 'purchase_invoice_details' }],
        },
      ],
    });

    if (goodsReceipt?.status !== GoodsReceiptStatusEnum.DRAFT) {
      return this.response.fail('Goods receipt status is not draft', 400);
    }

    if (
      goodsReceipt.purchase_invoice.status === PurchaseInvoiceStatus.COMPLETED
    ) {
      return this.response.fail('Invoice status already complete', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      let total = 0;
      for (const goodsReceiptDetail of goodsReceipt.goods_receipt_details) {
        const invoiceDetail =
          goodsReceipt.purchase_invoice.purchase_invoice_details.find(
            (value) => +value.product_id === +goodsReceiptDetail.product_id,
          );

        if (!invoiceDetail) {
          return this.response.fail(
            `Invoice detail not found for product ID ${goodsReceiptDetail.product_id}`,
            400,
          );
        }

        // Now invoiceDetail is guaranteed to be defined
        if (goodsReceiptDetail.quantity > invoiceDetail.remaining_quantity) {
          return this.response.fail(
            'Insufficient quantity (purchase invoice)',
            400,
          );
        }

        total = currency(total).add(
          currency(invoiceDetail.unit_price).multiply(
            goodsReceiptDetail.quantity,
          ).value,
        ).value;

        await invoiceDetail.decrement('remaining_quantity', {
          by: goodsReceiptDetail.quantity,
          transaction: transaction,
        });

        if (goodsReceipt.purchase_invoice.purchase_order_id !== null) {
          const purchaseOrderDetail =
            await this.purchaseOrderDetailModel.findOne({
              where: {
                purchase_order_id:
                  goodsReceipt.purchase_invoice.purchase_order_id,
                product_id: invoiceDetail.product_id,
              },
            });

          if (purchaseOrderDetail) {
            await purchaseOrderDetail.increment('quantity_received', {
              by: goodsReceiptDetail.quantity,
              transaction: transaction,
            });
          } else {
            return this.response.fail(
              `Purchase order detail not found for product ID ${invoiceDetail.product_id}`,
              400,
            );
          }
        }

        const inventoryIn =
          await this.inventoryTransactionService.transactionIn(
            {
              product_id: goodsReceiptDetail.product_id,
              warehouse_id: goodsReceipt.warehouse_id,
              quantity: goodsReceiptDetail.quantity,
              inable_id: goodsReceiptDetail.id,
              inable_type: GoodsReceiptDetail.name,
              cost: invoiceDetail.unit_price,
              date: goodsReceipt.date,
            },
            transaction,
          );

        if (goodsReceiptDetail.gr_serial_numbers.length > 0) {
          const serializeItems = [] as Array<{
            serial_code: string;
            inventory_id: number;
            warranty_end_date: Date;
            product_id: number;
            is_sold: boolean;
          }>;

          for (const number of goodsReceiptDetail.gr_serial_numbers) {
            serializeItems.push({
              serial_code: number.serial_number,
              inventory_id: inventoryIn.inventory_id,
              warranty_end_date: new Date(),
              product_id: goodsReceiptDetail.product_id,
              is_sold: false,
            });
          }

          await SerializeItem.bulkCreate(serializeItems, { transaction });
        }
      }

      await goodsReceipt.update(
        {
          status: GoodsReceiptStatusEnum.COMPLETED,
        },
        { transaction: transaction },
      );
      await transaction.commit();

      await this.checkPurchaseInvoiceQuantity(goodsReceipt.purchase_invoice_id);
      return this.response.success(
        goodsReceipt,
        200,
        'Successfully set complete goods receipt',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async cancelGoodsReceipt(id: number) {
    const goodsReceipt = await this.goodsReceiptModel.findOne({
      where: { id: id },
    });

    if (goodsReceipt?.status !== GoodsReceiptStatusEnum.DRAFT) {
      return this.response.fail('Goods receipt status is not draft', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await goodsReceipt.update(
        {
          status: GoodsReceiptStatusEnum.CANCELLED,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        goodsReceipt,
        200,
        'Successfully cancel goods receipt',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to cancel goods receipt', 400);
    }
  }

  private async checkPurchaseInvoiceQuantity(purchaseInvoiceId: number) {
    const purchaseInvoice = await this.purchaseInvoiceModel.findOne({
      where: { id: purchaseInvoiceId },
      include: [
        {
          association: 'purchase_invoice_details',
          where: { remaining_quantity: { [Op.gt]: 0 } },
        },
      ],
    });

    if (!purchaseInvoice) {
      await this.purchaseInvoiceModel.update(
        { status: PurchaseInvoiceStatus.COMPLETED },
        { where: { id: purchaseInvoiceId } },
      );
    }
  }

  async pdf(id: number, @Res() res, user: User) {
    try {
      const goodsReceipt = await this.goodsReceiptModel.findByPk(id, {
        include: [
          {
            association: 'goods_receipt_details',
            include: [
              { association: 'product' },
              { association: 'gr_serial_numbers' },
            ],
          },
          {
            association: 'warehouse',
          },
        ],
      });

      const pdfOptions: PDFOptions = {
        width: '21cm',
        height: '14.8cm',
        printBackground: true,
        displayHeaderFooter: false,

        headerTemplate: `
          <div class="mx-8 flex items-center justify-between border-b border-gray-300 pb-4">
            <div class="flex items-center space-x-10">
              <img 
                src="https://liszthoven.s3.ap-southeast-1.amazonaws.com/logo-black.png" 
                alt="Liszthoven Logo" 
                class="w-30" 
              />
              <div>
                <h1 class="text-lg font-semibold text-gray-800">Liszthoven Music School</h1>
                <p class="text-xs text-gray-600">
                  Email: ltv@gmail.com | Site: liszthoven.id
                </p>
              </div>
            </div>
            <div class="text-right">
              <h1 class="text-lg font-semibold text-[#053742]">Goods Receipt</h1>
              <p class="text-xs text-gray-500">
                Created Date: ${
                  goodsReceipt
                    ? `Created Date: ${moment(goodsReceipt.created_at).utcOffset(420).format('YYYY-MM-DD HH:mm')} WIB`
                    : 'Created Date: -'
                }WIB
              </p>
            </div>
          </div>`,
        footerTemplate: `
          <div class="absolute bottom-0 left-0 right-0 px-8">
            <div class="border-b pt-6 pb-2 text-xs font-semibold text-[#053742] italic text-center">
              Printed by admin on ${moment().utcOffset(420).format('YYYY-MM-DD HH:mm')} WIB
            </div>
            <div class="mt-2 bg-[#053742] py-4 text-center text-sm text-white">
              <p>Thank you for your trust in Liszthoven Music School</p>
            </div>
          </div>`,
        margin: {
          top: '30px',
          bottom: '30px',
        },
      };

      if (!goodsReceipt) {
        throw new Error('GoodsReceipt not found');
      }

      const pdf = await PdfHelper.pdf({
        html: this.goodReceiptPdf(
          goodsReceipt,
          pdfOptions.headerTemplate,
          pdfOptions.footerTemplate,
        ),
        pdfOptions: pdfOptions,
        watermarkImageUrl: `https://liszthoven.id/assets/images/logo/liszthoven-logo.webp`,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=goods-receipt-${goodsReceipt.id}.pdf`,
      );

      return res.send(pdf);
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  goodReceiptPdf(data: GoodsReceipt, headerTemplate, footerTemplate) {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    let goodsReceiptTr = '';
    if (data.goods_receipt_details?.length > 0) {
      data.goods_receipt_details.forEach((goodsReceiptDetail) => {
        goodsReceiptTr += `
          <tr class="border-b border-gray-200">
            <td class="py-2">${goodsReceiptDetail.product.name}</td>
            <td class="py-2">${goodsReceiptDetail.quantity} Pcs</td>
            <td class="py-2 text-right">
         ${
           (goodsReceiptDetail as any).gr_serial_numbers?.length > 0
             ? (goodsReceiptDetail as any).gr_serial_numbers
                 .map((serialNumber: any) => serialNumber.serial_number)
                 .join(', ')
             : '-'
         }
            </td>
          </tr>
        `;
      });
    }

    return `
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        </head>
        <body class="relative min-h-screen">
          ${headerTemplate}
          <div class="invoice-container relative mx-auto max-w-4xl p-8 pt-2">
            <div class="relative z-10">
              <!-- Details -->
              <div class="grid grid-cols-2 gap-4 py-4 text-sm">
                <div>
                  <p class="font-semibold text-[#053742]">No. Goods Receipt : ${data.goods_receipt_no}</p>
                  <p>Warehouse : ${data.warehouse.name}</p>
                </div>
              </div>
  
              <!-- Items Table -->
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-400">
                    <th class="w-2/6 py-2 text-left">ITEM DESCRIPTION</th>
                    <th class="w-1/6 py-2 text-left">QTY</th>
                    <th class="w-2/6 py-2 text-right">Serial Number</th>
                  </tr>
                </thead>
                <tbody>
                  ${goodsReceiptTr}
                </tbody>
              </table>
  
              <!-- Terms & Conditions -->
              <div class="grid grid-cols-2 gap-4 border-t border-gray-400 pt-4 text-sm">
                <div>
                  <h3 class="font-semibold text-[#053742]">TERMS & CONDITIONS</h3>
                  <p>Items purchased cannot be exchanged or returned.</p>
                </div>
              </div>
            </div>
  
            <!-- Signature -->
            <div class="relative mt-6 flex items-center justify-end text-sm">
              <div class="relative text-center">
                <p class="font-semibold">Best Regards</p>
                <div class="relative mx-auto mt-12 h-16 w-48 border-b-2 border-black">
                  <img src="https://liszthoven.id/assets/images/logo/liszthoven-logo.webp" alt="Liszthoven Stamp" 
                       class="top-1/4 bottom-16 h-25 translate-x-14 -translate-y-1/2 opacity-40" />
                </div>
                <p class="text-gray-500">Liszthoven Music School</p>
              </div>
            </div>
          </div>
          ${footerTemplate}
        </body>
      </html>
    `;
  }
}
