import { Injectable } from '@nestjs/common';
import { CreatePurchaseOrderDocumentDto } from './dto/create-purchase-order-document.dto';
import { UpdatePurchaseOrderDocumentDto } from './dto/update-purchase-order-document.dto';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { S3Helper } from 'src/helpers/s3.helper';
import { PurchaseOrderDocument } from './entities/purchase-order-document.entity';

@Injectable()
export class PurchaseOrderDocumentService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseOrderDocument)
    private purchaseOrderDocumentModel: typeof PurchaseOrderDocument,
  ) {}

  async create(
    orderId: number,
    files: Array<Express.Multer.File>,
    createPurchaseOrderDocumentDto: CreatePurchaseOrderDocumentDto,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const images: {
        purchase_order_id: number;
        path: string;
        url: string;
        extension: string;
        original_name: string;
      }[] = [];

      const s3Helper = new S3Helper();
      for (const [
        index,
        purchaseOrderDocument,
      ] of createPurchaseOrderDocumentDto.purchase_order_documents.entries()) {
        const getFile = files.filter((value) => {
          return value.fieldname.includes(
            `purchase_order_documents[${index}][file]`,
          );
        });

        if (getFile.length < 1) {
          throw new Error('File is required');
        }

        let originalName;
        if (purchaseOrderDocument.original_name !== '') {
          originalName = purchaseOrderDocument.original_name;
        } else {
          originalName = getFile[0].originalname;
        }

        const uploadedImage = await s3Helper.uploadFile(
          getFile[0],
          'purchase-order-documents/images',
          'public-read',
        );

        images.push({
          purchase_order_id: orderId,
          path: uploadedImage.Key,
          url: uploadedImage.Location,
          extension: getFile[0].mimetype,
          original_name: originalName,
        });
      }

      const purchaseOrderDocument =
        await this.purchaseOrderDocumentModel.bulkCreate(images, {
          transaction: transaction,
        });

      await transaction.commit();
      return this.response.success(
        purchaseOrderDocument,
        200,
        'Successfully create purchase order document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(
    orderId: number,
    id: number,
    updatePurchaseOrderDocumentDto: UpdatePurchaseOrderDocumentDto,
  ) {
    const purchaseOrderDocument = await this.purchaseOrderDocumentModel.findOne(
      { where: { id: id, purchase_order_id: orderId } },
    );
    if (!purchaseOrderDocument) {
      return this.response.fail('Purchase Order Documentnot found', 404);
    }

    const transaction = await this.sequelize.transaction();
    try {
      await purchaseOrderDocument.update(updatePurchaseOrderDocumentDto, {
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success(
        purchaseOrderDocument,
        200,
        'Successfully update purchase order document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async delete(orderId: number, id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      const purchaseOrderDocument =
        await this.purchaseOrderDocumentModel.findOne({
          where: { id: id, purchase_order_id: orderId },
          transaction: transaction,
        });
      if (!purchaseOrderDocument) {
        return this.response.fail('Purchase Order Documentnot found', 404);
      }

      const s3Helper = new S3Helper();
      await s3Helper.deleteFile(purchaseOrderDocument.path);

      await purchaseOrderDocument.destroy({
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase order document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
