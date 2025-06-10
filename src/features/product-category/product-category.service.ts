import { Injectable } from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductCategoryService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(ProductCategory)
    private productCategoryModel: typeof ProductCategory,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.productCategoryModel,
      query,
    ).getResult();

    const result = {
      count: count,
      product_categories: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve product categories',
    );
  }

  async findOne(id: number) {
    try {
      const productCategory = await this.productCategoryModel.findOne({
        where: { id },
      });
      return this.response.success(
        productCategory,
        200,
        ' Successfully get product category',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createProductCategoryDto: CreateProductCategoryDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const productCategory = await this.productCategoryModel.create(
        {
          ...createProductCategoryDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        productCategory,
        200,
        'Successfully create product category',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create product category', 400);
    }
  }

  async update(id: number, updateProductCategoryDto: CreateProductCategoryDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const productCategory = await this.productCategoryModel.findOne({
        where: { id: id },
      });

      if (!productCategory) {
        await transaction.rollback();
        return this.response.fail('Product Category not found', 404);
      }
      await productCategory.update(updateProductCategoryDto, {
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        productCategory,
        200,
        'Successfully update product category',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update product category', 400);
    }
  }

  async delete(id: number) {
    try {
      await this.productCategoryModel.destroy({
        where: { id },
      });
      return this.response.success(
        {},
        200,
        ' Successfully delete product category',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
