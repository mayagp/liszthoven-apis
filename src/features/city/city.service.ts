import { Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Subdistrict } from '../subdistrict/entities/subdistrict.entity';
import { City } from './entities/city.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class CityService {
  constructor(
    private sequelize: Sequelize,
    @InjectModel(City) private readonly cityModel: typeof City,
    private response: ResponseHelper,
  ) {}

  async findAll(query: any) {
    try {
      const { count, data } = await new QueryBuilderHelper(
        this.cityModel,
        query,
      ).getResult();

      const result = {
        count: count,
        cities: data,
      };
      return this.response.success(result, 200, 'Successfully retrieve cities');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async findOne(id: number) {
    try {
      const city = await this.cityModel.findOne({
        where: { id },
      });
      if (!city) {
        return this.response.fail('city not found', 404);
      }
      return this.response.success(city, 200, 'Successfully get city');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createCityDto: CreateCityDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const city = await this.cityModel.create(
        { ...createCityDto },
        { transaction },
      );
      await transaction.commit();
      return this.response.success(city, 200, 'Successfully create city');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async update(id: number, updateCityDto: CreateCityDto) {
    const city = await this.cityModel.findByPk(id);
    if (!city) {
      return this.response.fail('City not found', 404);
    }
    const transaction = await this.sequelize.transaction();
    try {
      await city.update({ ...updateCityDto }, { transaction });
      await transaction.commit();
      return this.response.success(city, 200, 'Successfully update city');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async delete(id: number) {
    const checkSubdistrict = await Subdistrict.findOne({
      where: { city_id: id },
    });
    if (checkSubdistrict) {
      return this.response.fail(
        'City still have subdistrict, please delete it first',
        400,
      );
    }

    const city = await this.cityModel.findByPk(id);
    if (!city) {
      return this.response.fail('City not found', 404);
    }
    const transaction = await this.sequelize.transaction();
    try {
      await city.destroy({ transaction });
      await transaction.commit();
      return this.response.success(city, 200, 'Successfully delete city');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }
}
