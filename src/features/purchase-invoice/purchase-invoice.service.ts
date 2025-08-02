import { Injectable, Res } from '@nestjs/common';
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
import * as moment from 'moment';
import { PDFOptions } from 'puppeteer';
import { PdfHelper } from 'src/helpers/pdf.helper';

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
          approved_by: user.id,
          approved_at: new Date(),
          status: PurchaseInvoiceStatus.APPROVED,
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

  async pdf(id: number, @Res() res, user: User) {
    try {
      const purchaseInvoice = await this.purchaseInvoiceModel.findByPk(id, {
        include: [
          {
            association: 'supplier',
            include: ['user'],
          },
          {
            association: 'purchase_invoice_details',
            include: ['product'],
          },
        ],
      });

      if (!purchaseInvoice) {
        return this.response.fail('Purcahse invoice not found', 404);
      }

      const pdfOptions: PDFOptions = {
        width: '21cm',
        height: '29.7cm',
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
                  <p class="text-xs text-gray-600">Email: ltv@gmail.com | Site: liszthoven.id</p>
                </div>
              </div>
              <div class="text-right">
                <h1 class="text-lg font-semibold text-[#053742]">Purchase Invoice</h1>
                <p class="text-xs text-gray-500">
                  Created Date: ${moment(purchaseInvoice.createdAt).utcOffset(420).format('YYYY-MM-DD HH:mm')} WIB
                </p>
              </div>
            </div>
          `,
        footerTemplate: `
            <div class="absolute bottom-0 left-0 right-0 px-8">
              <div class="border-b pt-6 pb-2 text-xs font-semibold text-[#053742] italic text-center">
                Printed by admin on ${moment().utcOffset(420).format('YYYY-MM-DD HH:mm')} WIB
              </div>
              <div class="mt-2 bg-[#053742] py-4 text-center text-sm text-white">
                <p>Thank you for your trust in Liszthoven Music School</p>
              </div>
            </div>
          `,
        margin: {
          top: '30px',
          bottom: '30px',
        },
      };

      const pdf = await PdfHelper.pdf({
        html: this.purchaseInvoicePdf(
          purchaseInvoice,
          pdfOptions.headerTemplate,
          pdfOptions.footerTemplate,
        ),
        pdfOptions: pdfOptions,
        watermarkImageUrl:
          'https://liszthoven.id/assets/images/logo/liszthoven-logo.webp',
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=purchase-invoice-${purchaseInvoice.invoice_no}.pdf`,
      );

      return res.send(pdf);
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  purchaseInvoicePdf(data: PurchaseInvoice, headerTemplate, footerTemplate) {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    let purchaseInvoiceTr = '';
    if (data.purchase_invoice_details?.length > 0) {
      data.purchase_invoice_details.forEach((item) => {
        purchaseInvoiceTr += `
            <tr class="border-b border-gray-200">
              <td class="py-2">${item.product.name}</td>
              <td class="py-2">${formatter.format(item.unit_price)}</td>
              <td class="py-2">${item.quantity} Pcs</td>
              <td class="py-2 text-right">${formatter.format(item.subtotal)}</td>
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
              <p class="font-semibold text-[#053742]">No. Invoice : ${data.invoice_no}</p>
              <p>Supplier : ${data.supplier.user.name}</p>
            </div>
          </div>
  
          <!-- Items Table -->
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-400">
                <th class="w-2/6 py-2 text-left">ITEM DESCRIPTION</th>
                <th class="w-2/6 py-2 text-left">UNIT PRICE</th>
                <th class="w-1/6 py-2 text-left">QTY</th>
                <th class="w-2/6 py-2 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${purchaseInvoiceTr}
            </tbody>
          </table>
  
          <!-- Totals -->
          <div class="mt-4 flex items-center justify-between text-sm font-semibold">
            <span>SUB TOTAL</span>
            <span class="text-[#053742]">${formatter.format(data.subtotal)}</span>
          </div>
           <div class="text-right text-sm font-semibold pt-2">
            <span>Shipping Cost</span>
            <span>${formatter.format(data.shipping_cost)}</span>
          </div>
          <div class="text-right text-sm font-semibold pt-2">
            <span>Tax</span>
            <span>${formatter.format(data.tax)}</span>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-gray-400 py-4 text-base font-semibold">
            <span>GRAND TOTAL</span>
            <span class="text-[#053742]">${formatter.format(data.grandtotal)}</span>
          </div>
  
          <!-- Terms & Conditions -->
          <div class="grid grid-cols-2 gap-4 pt-4 text-sm">
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
              <img src="https://liszthoven.id/assets/images/logo/liszthoven-logo.webp" alt="Liszthoven Stamp" class="top-1/4 bottom-16 h-25 translate-x-14 -translate-y-1/2 opacity-40" />
            </div>
            <p class="text-gray-500">Liszthoven Music School</p>
          </div>
        </div>
      </div>${footerTemplate}</body></html>
      `;
  }
}
