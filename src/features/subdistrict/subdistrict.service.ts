import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { CreateSubdistrictDto } from './dto/create-subdistrict.dto';
import { Subdistrict } from './entities/subdistrict.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class SubdistrictService {
  constructor(
    private sequelize: Sequelize,
    @InjectModel(Subdistrict)
    private readonly subdistrictModel: typeof Subdistrict,
    private response: ResponseHelper,
  ) {}

  async findAll(query: any) {
    try {
      const { count, data } = await new QueryBuilderHelper(
        this.subdistrictModel,
        query,
      ).getResult();

      const result = {
        count: count,
        subdistricts: data,
      };
      return this.response.success(
        result,
        200,
        'Successfully retrieve subdistricts',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async findOne(id: number) {
    try {
      const subdistrict = await this.subdistrictModel.findOne({
        where: { id },
      });

      return this.response.success(
        subdistrict,
        200,
        'Successfully get subdistrict',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createSubdistrictDto: CreateSubdistrictDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const subdistrict = await this.subdistrictModel.create(
        { ...createSubdistrictDto },
        { transaction },
      );
      await transaction.commit();
      return this.response.success(
        subdistrict,
        200,
        'Successfully create subdistrict',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(id: number, updateSubdistrictDto: CreateSubdistrictDto) {
    const subdistrict = await this.subdistrictModel.findByPk(id);
    if (!subdistrict) {
      return this.response.fail('SubDistrict not found', 404);
    }
    const transaction = await this.sequelize.transaction();
    try {
      await subdistrict.update({ ...updateSubdistrictDto }, { transaction });
      await transaction.commit();
      return this.response.success(
        subdistrict,
        200,
        'Successfully update subdistrict',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async delete(id: number) {
    const province = await this.subdistrictModel.findByPk(id);
    if (!province) {
      return this.response.fail('Province not found', 404);
    }
    const transaction = await this.sequelize.transaction();
    try {
      await province.destroy({ transaction });
      await transaction.commit();
      return this.response.success(
        province,
        200,
        'Successfully delete subdistrict',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }
}
