import { Injectable } from '@nestjs/common';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import { S3Helper } from 'src/helpers/s3.helper';
import { CreateProductDto } from '../product/dto/create-product.dto';
import { Product } from '../product/entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ProductImageService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(ProductImage)
    private productImageModel: typeof ProductImage,
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async create(
    productId: number,
    createProductDto: CreateProductDto,
    files: Array<Express.Multer.File>,
  ) {
    if (files.length <= 0) {
      return this.response.fail('Product image is required, atleast 1', 400);
    }

    const countIsDefault = createProductDto.product_images.filter(
      (value) => value.is_default === 'true',
    );

    if (countIsDefault.length > 1) {
      return this.response.fail('Only 1 default image is allowed', 400); // return exception if there is multiple default image
    }

    if (countIsDefault.length === 1) {
      await this.productImageModel.update(
        { is_default: false },
        { where: { product_id: productId } },
      );
    }

    const transaction = await this.sequelize.transaction();
    try {
      const lastProductImage = await this.productImageModel.findOne({
        where: { product_id: productId },
        order: [['sequence', 'desc']],
      });

      let lastSequenceNum = lastProductImage?.sequence ?? 0;
      const s3Helper = new S3Helper();
      for (const [
        index,
        productImage,
      ] of createProductDto.product_images.entries()) {
        const checkFile = files.filter((value) => {
          return value.fieldname.includes(`product_images[${index}][file]`);
        });

        if (checkFile.length > 0) {
          lastSequenceNum += 1;
          const uploadedImage = await s3Helper
            .uploadFile(checkFile[0], 'products/images', 'public-read')
            .catch((e) => {
              return this.response.fail(e.message, 400);
            });

          await this.productImageModel.create(
            {
              url: uploadedImage.Location,
              file_path: uploadedImage.Key,
              is_default: productImage.is_default === 'true',
              file_type: checkFile[0].mimetype,
              product_id: productId,
              sequence: lastSequenceNum,
            },
            { transaction: transaction },
          );
        } else {
          return this.response.fail('File is required', 400);
        }
      }

      await transaction.commit();

      const product = await this.productModel.findByPk(productId, {
        include: [{ association: 'product_images' }],
      });

      return this.response.success(
        product,
        200,
        'Successfully create product image',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create product image', 400);
    }
  }

  async update(
    productId: number,
    updateProductImageDto: UpdateProductImageDto,
  ) {
    const countIsDefault = updateProductImageDto.product_images.filter(
      (value) => value.is_default === true,
    );

    if (countIsDefault.length > 1) {
      return this.response.fail('Only 1 default image is allowed', 400); // return exception if there is multiple default image
    }

    const transaction = await this.sequelize.transaction();
    try {
      for (const productImage of updateProductImageDto.product_images) {
        if (productImage.is_default === true) {
          await this.productImageModel.update(
            { is_default: false },
            {
              where: { product_id: productId },
              transaction: transaction,
            },
          );
        }
        await this.productImageModel.update(productImage, {
          where: { id: productImage.id, product_id: productId },
          transaction: transaction,
        });
      }

      await transaction.commit();

      const product = await this.productModel.findByPk(productId, {
        include: { association: 'product_images' },
      });
      return this.response.success(
        product,
        200,
        'Successfully update product image',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update product', 400);
    }
  }

  async delete(productId: number, imageId: number) {
    try {
      const productImage = await this.productImageModel.findOne({
        where: { id: imageId, product_id: productId },
      });

      if (!productImage) {
        return this.response.fail('Product image not found', 404);
      }

      const s3Helper = new S3Helper();

      s3Helper.deleteFile(productImage.file_path);
      await productImage.destroy();

      return this.response.success(
        {},
        200,
        'Successfully deleted product image',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
