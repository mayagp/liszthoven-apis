import { Injectable } from '@nestjs/common';
import { CreatePurchaseInvoiceDocumentDto } from './dto/create-purchase-invoice-document.dto';
import { UpdatePurchaseInvoiceDocumentDto } from './dto/update-purchase-invoice-document.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { S3Helper } from 'src/helpers/s3.helper';
import { PurchaseInvoiceDocument } from './entities/purchase-invoice-document.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class PurchaseInvoiceDocumentService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseInvoiceDocument)
    private purchaseInvoiceDocumentModel: typeof PurchaseInvoiceDocument,
  ) {}

  async create(
    invoiceId: number,
    files: Array<Express.Multer.File>,
    createPurchaseInvoiceDocumentDto: CreatePurchaseInvoiceDocumentDto,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const images: {
        purchase_invoice_id: number;
        path: string;
        url: string;
        extension: string;
        original_name: string;
      }[] = [];

      const s3Helper = new S3Helper();
      for (const [
        index,
        purchaseInvoiceDocument,
      ] of createPurchaseInvoiceDocumentDto.purchase_invoice_documents.entries()) {
        const getFile = files.filter((value) => {
          return value.fieldname.includes(
            `purchase_invoice_documents[${index}][file]`,
          );
        });

        if (getFile.length < 1) {
          throw new Error('File is required');
        }

        let originalName;
        if (purchaseInvoiceDocument.original_name !== '') {
          originalName = purchaseInvoiceDocument.original_name;
        } else {
          originalName = getFile[0].originalname;
        }

        const uploadedImage = await s3Helper.uploadFile(
          getFile[0],
          'purchase-invoice-documents/images',
          'public-read',
        );

        images.push({
          purchase_invoice_id: invoiceId,
          path: uploadedImage.Key,
          url: uploadedImage.Location,
          extension: getFile[0].mimetype,
          original_name: originalName,
        });
      }

      const purchaseInvoiceDocument =
        await this.purchaseInvoiceDocumentModel.bulkCreate(images, {
          transaction: transaction,
        });

      await transaction.commit();
      return this.response.success(
        purchaseInvoiceDocument,
        200,
        'Successfully create purchase invoice document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(
    invoiceId: number,
    id: number,
    updatePurchaseInvoiceDocumentDto: UpdatePurchaseInvoiceDocumentDto,
  ) {
    const purchaseInvoiceDocument =
      await this.purchaseInvoiceDocumentModel.findOne({
        where: { id: id, purchase_invoice_id: invoiceId },
      });

    const transaction = await this.sequelize.transaction();

    if (!purchaseInvoiceDocument) {
      await transaction.rollback();
      return this.response.fail('Purchase invoice document not found', 404);
    }
    try {
      await purchaseInvoiceDocument.update(updatePurchaseInvoiceDocumentDto, {
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success(
        purchaseInvoiceDocument,
        200,
        'Successfully update purchase invoice document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async delete(invoiceId: number, id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      const purchaseInvoiceDocument =
        await this.purchaseInvoiceDocumentModel.findOne({
          where: { id: id, purchase_invoice_id: invoiceId },
          transaction: transaction,
        });

      if (!purchaseInvoiceDocument) {
        await transaction.rollback();
        return this.response.fail('Purchase invoice document not found', 404);
      }

      const s3Helper = new S3Helper();
      await s3Helper.deleteFile(purchaseInvoiceDocument.path);

      await purchaseInvoiceDocument.destroy({
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase invoice document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
