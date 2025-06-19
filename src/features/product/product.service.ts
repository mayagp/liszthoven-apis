import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { S3Helper } from 'src/helpers/s3.helper';
import { ProductCategory } from '../product-category/entities/product-category.entity';
import { Product } from './entities/product.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ProductService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.productModel,
      query,
    )
      .load('product_images')
      .getResult();

    const result = {
      count: count,
      products: data,
    };

    return this.response.success(result, 200, 'Successfully retrieve products');
  }

  async findOne(id: number) {
    try {
      const product = await this.productModel.findOne({
        where: { id },
        include: [
          {
            association: 'product_category',
          },
          {
            association: 'product_images',
          },
        ],
      });
      return this.response.success(product, 200, ' Successfully get product');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(
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
    } else if (countIsDefault.length === 0) {
      createProductDto.product_images[0].is_default = 'true'; // set first image as default image
    }

    const transaction = await this.sequelize.transaction();
    try {
      const s3Helper = new S3Helper();
      for (const [
        index,
        productImage,
      ] of createProductDto.product_images.entries()) {
        const checkFile = files.filter((value) => {
          return value.fieldname.includes(`product_images[${index}][file]`);
        });

        if (checkFile.length > 0) {
          const uploadedImage = await s3Helper
            .uploadFile(checkFile[0], 'products/images', 'public-read')
            .catch((e) => {
              return this.response.fail(e.message, 400);
            });

          createProductDto.product_images[index].url = uploadedImage.Location;
          createProductDto.product_images[index].file_path = uploadedImage.Key;
          createProductDto.product_images[index].file_type =
            checkFile[0].mimetype;
          createProductDto.product_images[index].is_default =
            createProductDto.product_images[index].is_default === 'true';
          createProductDto.product_images[index].sequence = index + 1;
        } else {
          return this.response.fail('File is required', 400);
        }
      }

      const product = await this.productModel.create(
        {
          ...createProductDto,
        },
        {
          include: [
            {
              association: 'product_category',
            },
            {
              association: 'product_images',
            },
          ],
          transaction: transaction,
        },
      );

      await transaction.commit();
      return this.response.success(product, 200, 'Successfully create product');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create product', 400);
    }
  }

  async update(id: number, updateProductDto: CreateProductDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const product = await this.productModel.findOne({
        where: { id: id },
        include: [
          {
            association: 'product_category',
          },
        ],
      });

      if (!product) {
        await transaction.rollback();
        return this.response.fail('Product not found', 404);
      }
      await product.update(updateProductDto, { transaction: transaction });
      await transaction.commit();
      return this.response.success(product, 200, 'Successfully update product');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update product', 400);
    }
  }

  async delete(id: number) {
    try {
      await this.productModel.destroy({
        where: { id },
      });
      return this.response.success({}, 200, ' Successfully delete product');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  // async importExcel(file: Express.Multer.File) {
  //   if (!file) {
  //     return this.response.fail('File is required', 400);
  //   }

  //   const xlsxModule = [
  //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     'text/csv',
  //   ];

  //   // Validate file type
  //   if (!xlsxModule.includes(file.mimetype)) {
  //     return this.response.fail(
  //       'Invalid file type, only xlsx or csv are allowed',
  //       400,
  //     );
  //   }

  //   const requiredFields = ['product_category', 'category', 'unit_sell_price'];
  //   const transaction = await this.sequelize.transaction();
  //   try {
  //     const excelFile = XLSX.read(file.buffer, { type: 'buffer' });
  //     const datas = XLSX.utils
  //       .sheet_to_json(excelFile.Sheets.Sheet1, {
  //         blankrows: false,
  //       })
  //       .map((value: any) => {
  //         for (const requiredField of requiredFields) {
  //           if (typeof value[requiredField] === 'undefined') {
  //             throw new Error(`${requiredField} is required`);
  //           }
  //         }

  //         if (!value.brand) {
  //           value.brand = null;
  //         }
  //         if (!value.subcategory) {
  //           value.subcategory = null;
  //         }
  //         if (!value.minimal_stock_level) {
  //           value.minimal_stock_level = null;
  //         }
  //         if (!value.stock_qty) {
  //           value.stock_qty = null;
  //         }

  //         return {
  //           brand: value.brand,
  //           product_category: value.product_category,
  //           category: value.category,
  //           subcategory: value.subcategory,
  //           minimal_stock_level: value.minimal_stock_level,
  //           stock_qty: value.stock_qty,
  //           uom: value.uom,
  //           unit_sell_price: value.unit_sell_price,
  //         };
  //       });

  //     const products = [];
  //     for (const data of datas) {
  //       let brand = data.brand;
  //       if (brand != null) {
  //         const [brandData, created] = await Brand.findOrCreate({
  //           where: { name: data.brand },
  //           defaults: { name: data.brand },
  //           transaction,
  //         });
  //         brand = brandData;
  //       } else {
  //         const [brandData, created] = await Brand.findOrCreate({
  //           where: { name: 'no brand' },
  //           defaults: { name: 'no brand' },
  //           transaction,
  //         });
  //         brand = brandData;
  //       }

  //       let productCategory;
  //       if (data.subcategory == null) {
  //         const [productCategoryData, created] =
  //           await ProductCategory.findOrCreate({
  //             where: { name: data.category },
  //             defaults: { name: data.category },
  //             transaction,
  //           });
  //         productCategory = productCategoryData;
  //       } else {
  //         const [parentCategory, parentCreated] =
  //           await ProductCategory.findOrCreate({
  //             where: { name: data.category },
  //             defaults: { name: data.category },
  //             transaction,
  //           });

  //         const [productCategoryData, created] =
  //           await ProductCategory.findOrCreate({
  //             where: { name: data.subcategory, parent_id: parentCategory.id },
  //             defaults: {
  //               name: data.subcategory,
  //               parent_id: parentCategory.id,
  //             },
  //             transaction,
  //           });
  //         productCategory = productCategoryData;
  //       }

  //       products.push({
  //         name: data.product_category,
  //         description: 'Import from excel',
  //         type: ProductTypeEnum.NONSERIALIZED,
  //         base_price: data.unit_sell_price,
  //         status: ProductStatusEnum.ACTIVE,
  //         uom: data.uom,
  //         valuation_method: ValuationMethodEnum.FIFO,
  //         product_category_id: productCategory.id,
  //         brand_id: brand.id,
  //         quantity: data.stock_qty,
  //         minimal_stock_level: data.minimal_stock_level,
  //       });
  //     }

  //     await this.productModel.bulkCreate(products, { transaction });
  //     await transaction.commit();
  //     return this.response.success(
  //       {},
  //       200,
  //       'Successfully import product from excel',
  //     );
  //   } catch (error) {
  //     await transaction.rollback();
  //     return this.response.fail(error, 400);
  //   }
  // }
}
