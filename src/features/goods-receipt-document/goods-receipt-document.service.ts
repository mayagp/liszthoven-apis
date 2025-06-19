import { Injectable } from '@nestjs/common';
import { CreateGoodsReceiptDocumentDto } from './dto/create-goods-receipt-document.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { S3Helper } from 'src/helpers/s3.helper';
import { GoodsReceiptDocument } from './entities/goods-receipt-document.entity';
import { Sequelize } from 'sequelize-typescript';
import { UpdateGoodsReceiptDocumentDto } from './dto/update-goods-receipt-document.dto';

@Injectable()
export class GoodsReceiptDocumentService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(GoodsReceiptDocument)
    private goodsReceiptDocumentModel: typeof GoodsReceiptDocument,
  ) {}

  async create(
    orderId: number,
    files: Array<Express.Multer.File>,
    createGoodsReceiptDocumentDto: CreateGoodsReceiptDocumentDto,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const images: {
        goods_receipt_id: number;
        path: string;
        url: string;
        extension: string;
        original_name: string;
      }[] = [];

      const s3Helper = new S3Helper();
      for (const [
        index,
        goodsReceiptDocument,
      ] of createGoodsReceiptDocumentDto.goods_receipt_documents.entries()) {
        const getFile = files.filter((value) => {
          return value.fieldname.includes(
            `goods_receipt_documents[${index}][file]`,
          );
        });

        if (getFile.length < 1) {
          throw new Error('File is required');
        }

        let originalName;
        if (goodsReceiptDocument.original_name !== '') {
          originalName = goodsReceiptDocument.original_name;
        } else {
          originalName = getFile[0].originalname;
        }

        const uploadedImage = await s3Helper.uploadFile(
          getFile[0],
          'goods-receipt-documents/images',
          'public-read',
        );

        images.push({
          goods_receipt_id: orderId,
          path: uploadedImage.Key,
          url: uploadedImage.Location,
          extension: getFile[0].mimetype,
          original_name: originalName,
        });
      }

      const goodsReceiptDocument =
        await this.goodsReceiptDocumentModel.bulkCreate(images, {
          transaction: transaction,
        });

      await transaction.commit();
      return this.response.success(
        goodsReceiptDocument,
        200,
        'Successfully create sale order document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(
    orderId: number,
    id: number,
    updateGoodsReceiptDocumentDto: UpdateGoodsReceiptDocumentDto,
  ) {
    const goodsReceiptDocument = await this.goodsReceiptDocumentModel.findOne({
      where: { id: id, goods_receipt_id: orderId },
    });

    if (!goodsReceiptDocument) {
      return this.response.fail('Goods receipt document not found', 404);
    }
    const transaction = await this.sequelize.transaction();
    try {
      await goodsReceiptDocument.update(updateGoodsReceiptDocumentDto, {
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success(
        goodsReceiptDocument,
        200,
        'Successfully update sale order document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async delete(orderId: number, id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      const goodsReceiptDocument = await this.goodsReceiptDocumentModel.findOne(
        {
          where: { id: id, goods_receipt_id: orderId },
          transaction: transaction,
        },
      );

      if (!goodsReceiptDocument) {
        return this.response.fail('Goods receipt document not found', 404);
      }

      const s3Helper = new S3Helper();
      await s3Helper.deleteFile(goodsReceiptDocument.path);

      await goodsReceiptDocument.destroy({
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete sale order document',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
