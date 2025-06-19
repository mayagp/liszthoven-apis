import { Injectable } from '@nestjs/common';
import { CreatePurchaseReturnDocumentDto } from './dto/create-purchase-return-document.dto';
import { UpdatePurchaseReturnDocumentDto } from './dto/update-purchase-return-document.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { S3Helper } from 'src/helpers/s3.helper';
import { PurchaseReturnDocument } from './entities/purchase-return-document.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class PurchaseReturnDocumentService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(PurchaseReturnDocument)
    private purchaseReturnDocumentModel: typeof PurchaseReturnDocument,
  ) {}

  async create(
    returnId: number,
    files: Array<Express.Multer.File>,
    createPurchaseReturnDocumentDto: CreatePurchaseReturnDocumentDto,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const images: {
        purchase_return_id: number;
        path: string;
        url: string;
        extension: string;
        original_name: string;
      }[] = [];
      const s3Helper = new S3Helper();
      for (const [
        index,
        purchaseReturnDocument,
      ] of createPurchaseReturnDocumentDto.purchase_return_documents.entries()) {
        const getFile = files.filter((value) => {
          return value.fieldname.includes(
            `purchase_return_documents[${index}][file]`,
          );
        });

        if (getFile.length < 1) {
          throw new Error('File is required');
        }

        let originalName;
        if (purchaseReturnDocument.original_name !== '') {
          originalName = purchaseReturnDocument.original_name;
        } else {
          originalName = getFile[0].originalname;
        }

        const uploadedImage = await s3Helper.uploadFile(
          getFile[0],
          'purchase-return-documents/images',
          'public-read',
        );

        images.push({
          purchase_return_id: returnId,
          path: uploadedImage.Key,
          url: uploadedImage.Location,
          extension: getFile[0].mimetype,
          original_name: originalName,
        });
      }

      const purchaseReturnDocument =
        await this.purchaseReturnDocumentModel.bulkCreate(images, {
          transaction: transaction,
        });

      await transaction.commit();
      return this.response.success(
        purchaseReturnDocument,
        200,
        'Successfully create purchase return document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(
    returnId: number,
    id: number,
    updatePurchaseReturnDocumentDto: UpdatePurchaseReturnDocumentDto,
  ) {
    const purchaseReturnDocument =
      await this.purchaseReturnDocumentModel.findOne({
        where: { id: id, purchase_return_id: returnId },
      });

    const transaction = await this.sequelize.transaction();

    if (!purchaseReturnDocument) {
      await transaction.rollback();
      return this.response.fail('Purchase return document not found', 404);
    }

    try {
      await purchaseReturnDocument.update(updatePurchaseReturnDocumentDto, {
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success(
        purchaseReturnDocument,
        200,
        'Successfully update purchase return document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async delete(returnId: number, id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      const purchaseReturnDocument =
        await this.purchaseReturnDocumentModel.findOne({
          where: { id: id, purchase_return_id: returnId },
          transaction: transaction,
        });

      if (!purchaseReturnDocument) {
        await transaction.rollback();
        return this.response.fail(
          { message: 'Purchase return document not found' },
          404,
        );
      }
      const s3Helper = new S3Helper();
      await s3Helper.deleteFile(purchaseReturnDocument.path);

      await purchaseReturnDocument.destroy({
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete purchase return document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
