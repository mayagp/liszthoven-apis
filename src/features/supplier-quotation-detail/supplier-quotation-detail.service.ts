import { Injectable } from '@nestjs/common';
import { CreateSupplierQuotationDetailDto } from './dto/create-supplier-quotation-detail.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { SupplierQuotation } from '../supplier-quotation/entities/supplier-quotation.entity';
import SupplierQuotationStatus from '../supplier-quotation/enum/supplier-quotation-status.enum';
import { SupplierQuotationDetail } from './entities/supplier-quotation-detail.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class SupplierQuotationDetailService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(SupplierQuotation)
    private supplierQuotationModel: typeof SupplierQuotation,
    @InjectModel(SupplierQuotationDetail)
    private supplierQuotationDetailModel: typeof SupplierQuotationDetail,
  ) {}

  async create(
    supplierQuotationId: number,
    createSupplierQuotationDetailDto: CreateSupplierQuotationDetailDto,
  ) {
    const supplierQuotation = await this.supplierQuotationModel.findOne({
      where: { id: supplierQuotationId },
    });

    if (!supplierQuotation) {
      return this.response.fail('Supplier quotation not found', 404);
    }
    if (supplierQuotation.status === SupplierQuotationStatus.CANCELLED) {
      return this.response.fail('Supplier quotation already cancelled', 400);
    }

    const isProductExists = await this.supplierQuotationDetailModel.findOne({
      where: {
        product_id: createSupplierQuotationDetailDto.product_id,
        supplier_quotation_id: supplierQuotationId,
      },
    });

    if (isProductExists) {
      return this.response.fail(
        'Product already exists, please use update instead create',
        400,
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      const total =
        +createSupplierQuotationDetailDto.price_per_unit *
        +createSupplierQuotationDetailDto.quantity;

      createSupplierQuotationDetailDto.total = total;

      // Update supplier quotation subtotal and grandtotal
      await supplierQuotation.update(
        {
          subtotal: +supplierQuotation.subtotal + +total,
          grandtotal: +supplierQuotation.grandtotal + +total,
        },
        { transaction: transaction },
      );

      const supplierQuotationDetail =
        await this.supplierQuotationDetailModel.create(
          {
            ...createSupplierQuotationDetailDto,
            supplier_quotation_id: supplierQuotationId,
          },
          { transaction: transaction },
        );

      await transaction.commit();

      await supplierQuotationDetail.reload({
        include: [
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
        ],
      });
      return this.response.success(
        supplierQuotationDetail,
        200,
        'Successfully create supplier quotation detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        'Failed to create supplier quotation detail',
        400,
      );
    }
  }

  async update(
    supplierQuotationId: number,
    supplierQuotationDetailId: number,
    updateSupplierQuotationDetailDto: CreateSupplierQuotationDetailDto,
  ) {
    const supplierQuotation = await this.supplierQuotationModel.findOne({
      where: { id: supplierQuotationId },
    });

    if (!supplierQuotation) {
      return this.response.fail('Supplier quotation not found', 404);
    }

    if (supplierQuotation.status === SupplierQuotationStatus.CANCELLED) {
      return this.response.fail('Supplier quotation already cancelled', 400);
    }

    const supplierQuotationDetail =
      await this.supplierQuotationDetailModel.findOne({
        where: {
          id: supplierQuotationDetailId,
          supplier_quotation_id: supplierQuotationId,
        },
      });

    if (!supplierQuotationDetail) {
      return this.response.fail('Supplier quotation detail not found', 404);
    }

    const transaction = await this.sequelize.transaction();
    try {
      // recalculate all total
      const newTotal =
        +updateSupplierQuotationDetailDto.price_per_unit *
        updateSupplierQuotationDetailDto.quantity;

      updateSupplierQuotationDetailDto.total = newTotal;

      const grandTotal =
        +supplierQuotation.grandtotal - +supplierQuotationDetail.total;
      const subTotal =
        +supplierQuotation.subtotal - +supplierQuotationDetail.total;

      await supplierQuotationDetail.update(
        {
          ...updateSupplierQuotationDetailDto,
          total: newTotal,
        },
        { transaction: transaction },
      );

      await supplierQuotation.update(
        {
          grandtotal: grandTotal + newTotal,
          subtotal: subTotal + newTotal,
        },
        { transaction: transaction },
      );
      await transaction.commit();

      await supplierQuotationDetail.reload({
        include: [
          {
            association: 'product',
            include: [{ association: 'product_images' }],
          },
        ],
      });
      return this.response.success(
        supplierQuotationDetail,
        200,
        'Successfully update supplier quotation detail',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(
        'Failed to update supplier quotation detail',
        400,
      );
    }
  }

  async delete(supplierQuotationId: number, supplierQuotationDetailId: number) {
    const supplierQuotation = await this.supplierQuotationModel.findOne({
      where: { id: supplierQuotationId },
    });
    if (!supplierQuotation) {
      return this.response.fail('Supplier quotation not found', 404);
    }

    if (supplierQuotation.status === SupplierQuotationStatus.CANCELLED) {
      return this.response.fail(
        'Supplier quotation status already cancelled',
        400,
      );
    }

    const supplierQuotationDetail =
      await this.supplierQuotationDetailModel.findOne({
        where: {
          id: supplierQuotationDetailId,
          supplier_quotation_id: supplierQuotationId,
        },
      });

    if (!supplierQuotationDetail) {
      return this.response.fail('Supplier quotation detail not found', 404);
    }

    try {
      // recalculate supplier quotation
      await supplierQuotation.update({
        grandtotal:
          +supplierQuotation.grandtotal - +supplierQuotationDetail.total,
        subtotal: +supplierQuotation.subtotal - +supplierQuotationDetail.total,
      });

      // force delete supplier quotation detail
      await supplierQuotationDetail.destroy();
      return this.response.success(
        {},
        200,
        'Successfully delete supplier quotation detail',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
