import { Injectable, Res } from '@nestjs/common';
import { CreateSupplierQuotationDto } from './dto/create-supplier-quotation.dto';
import { UpdateSupplierQuotationDto } from './dto/update-supplier-quotation.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'aws-sdk/clients/appstream';
import { PDFOptions } from 'puppeteer';
import { Op } from 'sequelize';
import { PdfHelper } from 'src/helpers/pdf.helper';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { SupplierQuotationDetail } from '../supplier-quotation-detail/entities/supplier-quotation-detail.entity';
import { SupplierQuotation } from './entities/supplier-quotation.entity';
import { Sequelize } from 'sequelize-typescript';
import * as moment from 'moment';
import SupplierQuotationStatus from './enum/supplier-quotation-status.enum';

@Injectable()
export class SupplierQuotationService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(SupplierQuotation)
    private supplierQuotationModel: typeof SupplierQuotation,
    @InjectModel(SupplierQuotationDetail)
    private supplierQuotationDetailModel: typeof SupplierQuotationDetail,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.supplierQuotationModel,
      query,
    )
      .load('supplier.user')
      .getResult();

    const result = {
      count: count,
      supplier_quotations: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve supplier quotations',
    );
  }

  async findOne(id: number) {
    try {
      const supplierQuotation = await this.supplierQuotationModel.findOne({
        where: { id },
        include: [
          {
            association: 'supplier_quotation_details',
            include: [
              {
                association: 'product',
                include: [{ association: 'product_images' }],
              },
            ],
          },
          {
            association: 'supplier',
            include: [{ association: 'user' }],
          },
        ],
      });
      return this.response.success(
        supplierQuotation,
        200,
        ' Successfully get supplier quotation',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createSupplierQuotationDto: CreateSupplierQuotationDto) {
    const transaction = await this.sequelize.transaction();
    try {
      let subtotal = 0;

      for (const supplierQuotationDetail of createSupplierQuotationDto.supplier_quotation_details) {
        const total =
          +supplierQuotationDetail.price_per_unit *
          +supplierQuotationDetail.quantity;
        subtotal += total;

        supplierQuotationDetail.total = total;
      }

      const grandtotal = +subtotal + +createSupplierQuotationDto.tax;

      const supplierQuotation = await this.supplierQuotationModel.create(
        {
          ...createSupplierQuotationDto,
          subtotal: subtotal,
          grandtotal: grandtotal,
        },
        {
          include: [
            {
              association: 'supplier_quotation_details',
            },
          ],
          transaction: transaction,
        },
      );

      await transaction.commit();
      return this.response.success(
        supplierQuotation,
        200,
        'Successfully create supplier quotation',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create supplier quotation', 400);
    }
  }

  async update(
    id: number,
    updateSupplierQuotationDto: UpdateSupplierQuotationDto,
  ) {
    const supplierQuotation = await this.supplierQuotationModel.findByPk(id);

    if (!supplierQuotation) {
      return this.response.fail('Supplier quotation not found', 404);
    }
    if (
      supplierQuotation.quotation_no !== updateSupplierQuotationDto.quotation_no
    ) {
      const isQuotationNoExists = await this.supplierQuotationModel.findOne({
        where: { quotation_no: updateSupplierQuotationDto.quotation_no },
      });

      if (isQuotationNoExists) {
        return this.response.fail('Quotation no already exists', 400);
      }
    }

    const transaction = await this.sequelize.transaction();
    try {
      const grandtotal =
        +supplierQuotation.subtotal + +updateSupplierQuotationDto.tax;
      await supplierQuotation.update(
        {
          ...updateSupplierQuotationDto,
          grandtotal: grandtotal,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        supplierQuotation,
        200,
        'Successfully update supplier quotation',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update supplier quotation', 400);
    }
  }

  async delete(id: number) {
    const supplierQuotation = await this.supplierQuotationModel.findOne({
      where: { id: id },
      include: [{ association: 'supplier_quotation_details' }],
    });
    if (!supplierQuotation) {
      return this.response.fail('Supplier quotation not found', 404);
    }

    try {
      const supplierQuotationDetailIds =
        supplierQuotation.supplier_quotation_details.map((value) => +value.id);

      await this.supplierQuotationDetailModel.destroy({
        where: { id: { [Op.in]: supplierQuotationDetailIds } },
      });
      await supplierQuotation.destroy();
      return this.response.success(
        {},
        200,
        'Successfully delete supplier quotation',
      );
    } catch (error) {
      return this.response.fail('Failed to delete supplier quotation', 400);
    }
  }

  async setStatusAsReceived(id: number) {
    const supplierQuotation = await this.supplierQuotationModel.findOne({
      where: { id: id },
    });

    if (!supplierQuotation) {
      return this.response.fail('Supplier quotation not found', 404);
    }

    if (supplierQuotation.status !== SupplierQuotationStatus.PENDING) {
      return this.response.fail(
        'Supplier quotation already received or cancelled',
        400,
      );
    }

    try {
      await supplierQuotation.update({
        status: SupplierQuotationStatus.RECEIVED,
      });
      return this.response.success(
        supplierQuotation,
        200,
        'Successfully set status as received',
      );
    } catch (error) {
      return this.response.fail('Failed to set status as received', 400);
    }
  }

  async setStatusAsCancelled(id: number) {
    const supplierQuotation = await this.supplierQuotationModel.findOne({
      where: { id: id },
    });

    if (!supplierQuotation) {
      return this.response.fail('Supplier quotation not found', 404);
    }

    if (supplierQuotation.status !== SupplierQuotationStatus.PENDING) {
      return this.response.fail(
        'Supplier quotation already received or cancelled',
        400,
      );
    }

    try {
      await supplierQuotation.update({
        status: SupplierQuotationStatus.CANCELLED,
      });
      return this.response.success(
        supplierQuotation,
        200,
        'Successfully set status as cancelled',
      );
    } catch (error) {
      return this.response.fail('Failed to set status as cancelled', 400);
    }
  }

  async pdf(id: number, @Res() res, user: User) {
    try {
      const supplierQuotation = await this.supplierQuotationModel.findByPk(id, {
        include: [
          {
            association: 'supplier',
          },
          {
            association: 'supplier_quotation_details',
            include: ['product'],
          },
        ],
      });

      if (!supplierQuotation) {
        return this.response.fail('Supplier quotation not found', 404);
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
              <h1 class="text-lg font-semibold text-[#053742]">Supplier Quotation</h1>
              <p class="text-xs text-gray-500">
                Created Date: ${moment(supplierQuotation.created_at).utcOffset(420).format('YYYY-MM-DD HH:mm')} WIB
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
        html: this.supplierQuotationPdf(
          supplierQuotation,
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
        `attachment; filename=supplier-quotation-${supplierQuotation.quotation_no}.pdf`,
      );

      return res.send(pdf);
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  supplierQuotationPdf(
    data: SupplierQuotation,
    headerTemplate,
    footerTemplate,
  ) {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    let supplierQuotationTr = '';
    if (data.supplier_quotation_details?.length > 0) {
      data.supplier_quotation_details.forEach((item) => {
        supplierQuotationTr += `
          <tr class="border-b border-gray-200">
            <td class="py-2">${item.product.name}</td>
            <td class="py-2">${formatter.format(item.price_per_unit)}</td>
            <td class="py-2">${item.quantity} Pcs</td>
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
            <p class="font-semibold text-[#053742]">No. Quotation : ${data.quotation_no}</p>
            <p>Supplier : ${data.supplier.tax_no}</p>
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
            ${supplierQuotationTr}
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
            <img src="https://liszthoven.id/assets/images/logo/liszthoven-logo.webp" alt="Liszthoven Stamp" class="top-1/4 bottom-16 h-25 translate-x-14 -translate-y-1/2 opacity-40" />
          </div>
          <p class="text-gray-500">Liszthoven Music School</p>
        </div>
      </div>
    </div>${footerTemplate}</body></html>
    `;
  }
}
