import { Injectable, Res } from '@nestjs/common';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { InjectModel } from '@nestjs/sequelize';
import moment from 'moment';
import { PDFOptions } from 'puppeteer';
import { Op } from 'sequelize';
import { PdfHelper } from 'src/helpers/pdf.helper';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { AutoNumberService } from '../auto-number/auto-number.service';
import { PurchaseOrderDetail } from '../purchase-order-detail/entities/purchase-order-detail.entity';
import PurchaseOrderDetailStatus from '../purchase-order-detail/enum/purchase-order-detail-status.enum';
import { PurchaseOrder } from './entities/purchase-order.entity';
import PurchaseOrderStatus from './enum/purchase-order-status.enum';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseOrder)
    private purchaseOrderModel: typeof PurchaseOrder,
    @InjectModel(PurchaseOrderDetail)
    private purchaseOrderDetailModel: typeof PurchaseOrderDetail,
    private autoNumberService: AutoNumberService,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.purchaseOrderModel,
      query,
    )
      .load('supplier.user')
      .getResult();

    const result = {
      count: count,
      purchase_orders: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve purchase orders',
    );
  }

  async findOne(id: number) {
    try {
      const purchaseOrder = await this.purchaseOrderModel.findOne({
        where: { id },
        include: [
          {
            association: 'purchase_order_details',
            include: [
              {
                association: 'supplier_quotation',
              },
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
          {
            association: 'supplier',
            include: [
              {
                association: 'user',
              },
            ],
          },
          {
            association: 'branch',
          },
        ],
      });

      return this.response.success(
        purchaseOrder,
        200,
        'Successfully get purchase order',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto, user: User) {
    let subtotal = 0;

    // Process purchase order detail
    for (const purchaseOrderDetail of createPurchaseOrderDto.purchase_order_details) {
      const total =
        purchaseOrderDetail.quantity_ordered *
        +purchaseOrderDetail.price_per_unit;
      purchaseOrderDetail.total = total;
      purchaseOrderDetail.status = PurchaseOrderDetailStatus.CREATED;
      purchaseOrderDetail.remaining_quantity =
        purchaseOrderDetail.quantity_ordered;

      // save to subtotal variable
      subtotal += total;
    }

    const transaction = await this.sequelize.transaction();
    try {
      createPurchaseOrderDto.purchase_order_no =
        await this.autoNumberService.generateAutoNumber(
          PurchaseOrder.name,
          transaction,
        );

      const purchaseOrder = await this.purchaseOrderModel.create(
        {
          ...createPurchaseOrderDto,
          status: PurchaseOrderStatus.PENDING,
          subtotal: subtotal,
          grandtotal: subtotal + +createPurchaseOrderDto.tax,
          created_by: user.id,
        },
        {
          include: [
            {
              association: 'purchase_order_details',
              include: [
                {
                  association: 'supplier_quotation',
                },
              ],
            },
          ],
          transaction: transaction,
        },
      );

      await transaction.commit();
      return this.response.success(
        purchaseOrder,
        200,
        'Successfully create purchase order',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(id: number, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
    const purchaseOrder = await this.purchaseOrderModel.findOne({
      where: { id: id },
    });

    if (purchaseOrder?.status !== PurchaseOrderStatus.PENDING) {
      return this.response.fail('Purchase order already in progress', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchaseOrder.update(
        {
          ...updatePurchaseOrderDto,
          grandtotal: +purchaseOrder.subtotal + +updatePurchaseOrderDto.tax,
        },
        { transaction: transaction },
      );
      await transaction.commit();

      await purchaseOrder.reload({
        include: [{ association: 'supplier' }, { association: 'branch' }],
      });
      return this.response.success(
        purchaseOrder,
        200,
        'Successfully update purchase order',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update purchase order', 400);
    }
  }

  async delete(id: number) {
    const purchaseOrder = await this.purchaseOrderModel.findOne({
      where: { id: id },
      include: [
        {
          association: 'purchase_order_details',
        },
      ],
    });

    if (purchaseOrder?.status !== PurchaseOrderStatus.PENDING) {
      return this.response.fail('Purchase order already in progress', 400);
    }

    try {
      const purchaseOrderDetailIds = purchaseOrder.purchase_order_details.map(
        (value) => value.id,
      );

      await this.purchaseOrderDetailModel.destroy({
        where: { id: { [Op.in]: purchaseOrderDetailIds } },
      });

      await purchaseOrder.destroy();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase order',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async approvePurchaseOrder(id: number, user: User) {
    const purchaseOrder = await this.purchaseOrderModel.findOne({
      where: { id: id },
    });

    if (purchaseOrder?.status !== PurchaseOrderStatus.PENDING) {
      return this.response.fail('Purchase order already in progress', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchaseOrder.update(
        {
          status: PurchaseOrderStatus.APPROVED,
          approved_at: new Date(),
          approved_by: user.id,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        purchaseOrder,
        200,
        'Successfully approve purchase order',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to approve purchase order', 400);
    }
  }

  async cancelPurchaseOrder(id: number) {
    const purchaseOrder = await this.purchaseOrderModel.findOne({
      where: { id: id },
    });

    if (purchaseOrder?.status !== PurchaseOrderStatus.PENDING) {
      return this.response.fail('Purchase order already in progress', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchaseOrder.update(
        {
          status: PurchaseOrderStatus.CANCELLED,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        purchaseOrder,
        200,
        'Successfully cancel purchase order',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to cancel purchase order', 400);
    }
  }

  async pdf(id: number, @Res() res, user: User) {
    try {
      const purchaseOrder = await this.purchaseOrderModel.findByPk(id, {
        include: [
          { association: 'supplier' },
          {
            association: 'purchase_order_details',
            include: ['product'],
          },
          {
            association: 'branch',
          },
        ],
      });

      if (!purchaseOrder) {
        return this.response.fail('Purchase Order not found', 404);
      }

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
                 <h2 class="text-lg font-semibold text-gray-800">Liszthoven Music School</h2>
                 <p class="text-xs text-gray-600">
                   Email: ltv@gmail.com | Site: liszthoven.id
                 </p>
               </div>
             </div>
             <div class="text-right">
               <h1 class="text-lg font-semibold text-[#053742]">Purchase Order</h1>
               <p class="text-xs text-gray-500">
                 Created Date: ${moment(purchaseOrder.created_at).utcOffset(420).format('YYYY-MM-DD HH:mm')} WIB
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
        html: this.purchaseOrderPdf(
          purchaseOrder,
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
        `attachment; filename=purchase-order-${purchaseOrder.id}.pdf`,
      );

      return res.send(pdf);
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  purchaseOrderPdf(data, headerTemplate, footerTemplate) {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    let purchaseOrderTr = '';
    if (data.purchase_order_details?.length > 0) {
      data.purchase_order_details.forEach((item) => {
        purchaseOrderTr += `
           <tr class="border-b border-gray-200">
             <td class="py-2">${item.product.name}</td>
             <td class="py-2">${formatter.format(item.price_per_unit)}</td>
             <td class="py-2">${item.quantity_ordered} Pcs</td>
             <td class="py-2 text-right">${formatter.format(item.total)}</td>
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
                   <p class="font-semibold text-[#053742]">
                     No. Purchase Order : ${data.purchase_order_no}
                   </p>
                   <p>Branch : ${data.branch.address}</p>
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
                   ${purchaseOrderTr}
                 </tbody>
               </table>
   
               <!-- Totals -->
               <div class="mt-4 flex items-center justify-between text-sm font-semibold">
                 <span>SUB TOTAL</span>
                 <span class="text-[#053742]">${formatter.format(data.subtotal)}</span>
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
                   <img 
                     src="https://liszthoven.id/assets/images/logo/liszthoven-logo.webp" 
                     alt="Liszthoven Stamp" 
                     class="top-1/4 bottom-16 h-25 translate-x-14 -translate-y-1/2 opacity-40"
                   />
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
