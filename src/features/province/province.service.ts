import { Injectable } from '@nestjs/common';
import { CreateProvinceDto } from './dto/create-province.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { City } from '../city/entities/city.entity';
import { Province } from './entities/province.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ProvinceService {
  constructor(
    private sequelize: Sequelize,
    @InjectModel(Province) private provinceModel: typeof Province,
    private response: ResponseHelper,
  ) {}

  async findAll(query: any) {
    try {
      const { count, data } = await new QueryBuilderHelper(
        this.provinceModel,
        query,
      ).getResult();

      const result = {
        count: count,
        provinces: data,
      };
      return this.response.success(
        result,
        200,
        'Successfully retrieve provinces',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async findOne(id: number) {
    try {
      const province = await this.provinceModel.findOne({
        where: { id },
      });

      return this.response.success(province, 200, 'Successfully get province');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createProvinceDto: CreateProvinceDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const province = await this.provinceModel.create(
        { ...createProvinceDto },
        { transaction },
      );
      await transaction.commit();
      return this.response.success(
        province,
        200,
        'Successfully create province',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(id: number, updateProvinceDto: CreateProvinceDto) {
    const province = await this.provinceModel.findByPk(id);
    if (!province) {
      return this.response.fail('Province not found', 404);
    }
    const transaction = await this.sequelize.transaction();
    try {
      await province.update({ ...updateProvinceDto }, { transaction });
      await transaction.commit();
      return this.response.success(
        province,
        200,
        'Successfully update province',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async delete(id: number) {
    const checkProvince = await City.findOne({
      where: { province_id: id },
    });
    if (checkProvince) {
      return this.response.fail(
        'Province still have city, please delete it first',
        400,
      );
    }

    const province = await this.provinceModel.findByPk(id);
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
        'Successfully delete province',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }
}
