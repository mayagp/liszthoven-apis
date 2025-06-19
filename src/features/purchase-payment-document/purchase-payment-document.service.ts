import { Injectable } from '@nestjs/common';
import { CreatePurchasePaymentDocumentDto } from './dto/create-purchase-payment-document.dto';
import { UpdatePurchasePaymentDocumentDto } from './dto/update-purchase-payment-document.dto';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { S3Helper } from 'src/helpers/s3.helper';
import { PurchasePaymentDocument } from './entities/purchase-payment-document.entity';

@Injectable()
export class PurchasePaymentDocumentService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchasePaymentDocument)
    private purchasePaymentDocumentModel: typeof PurchasePaymentDocument,
  ) {}

  async create(
    paymentId: number,
    files: Array<Express.Multer.File>,
    createPurchasePaymentDocumentDto: CreatePurchasePaymentDocumentDto,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const images: {
        purchase_payment_id: number;
        path: string;
        url: string;
        extension: string;
        original_name: string;
      }[] = [];
      const s3Helper = new S3Helper();
      for (const [
        index,
        purchasePaymentDocument,
      ] of createPurchasePaymentDocumentDto.purchase_payment_documents.entries()) {
        const getFile = files.filter((value) => {
          return value.fieldname.includes(
            `purchase_payment_documents[${index}][file]`,
          );
        });

        if (getFile.length < 1) {
          throw new Error('File is required');
        }

        let originalName;
        if (purchasePaymentDocument.original_name !== '') {
          originalName = purchasePaymentDocument.original_name;
        } else {
          originalName = getFile[0].originalname;
        }

        const uploadedImage = await s3Helper.uploadFile(
          getFile[0],
          'purchase-return-documents/images',
          'public-read',
        );

        images.push({
          purchase_payment_id: paymentId,
          path: uploadedImage.Key,
          url: uploadedImage.Location,
          extension: getFile[0].mimetype,
          original_name: originalName,
        });
      }

      const purchasePaymentDocument =
        await this.purchasePaymentDocumentModel.bulkCreate(images, {
          transaction: transaction,
        });

      await transaction.commit();
      return this.response.success(
        purchasePaymentDocument,
        200,
        'Successfully create purchase payment document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(
    paymentId: number,
    id: number,
    updatePurchasePaymentDocumentDto: UpdatePurchasePaymentDocumentDto,
  ) {
    const purchasePaymentDocument =
      await this.purchasePaymentDocumentModel.findOne({
        where: { id: id, purchase_payment_id: paymentId },
      });

    if (!purchasePaymentDocument) {
      return this.response.fail('Purchase payment document not found', 404);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchasePaymentDocument.update(updatePurchasePaymentDocumentDto, {
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success(
        purchasePaymentDocument,
        200,
        'Successfully update purchase payment document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async delete(paymentId: number, id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      const purchasePaymentDocument =
        await this.purchasePaymentDocumentModel.findOne({
          where: { id: id, purchase_payment_id: paymentId },
          transaction: transaction,
        });

      if (!purchasePaymentDocument) {
        return this.response.fail('Purchase payment document not found', 404);
      }

      const s3Helper = new S3Helper();
      await s3Helper.deleteFile(purchasePaymentDocument.path);

      await purchasePaymentDocument.destroy({
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase payment document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
