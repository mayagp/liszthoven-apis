import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Staff } from './entities/staff.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class StaffService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(Staff) private staffModel: typeof Staff,
    // private autoNumbersAdminService: AutoNumbersAdminService,
  ) {}

  async findAll(query: any) {
    try {
      const builder = new QueryBuilderHelper(this.staffModel, query);

      if (typeof query?.day !== 'undefined') {
        delete query.day;
      }

      if (typeof query?.week !== 'undefined') {
        delete query.week;
      }

      const { count, data } = await builder
        .load('user')
        .options({
          include: [
            {
              association: 'branch',
              paranoid: false,
              required: false,
            },
          ],
        })
        .getResult();

      const result = {
        count: count,
        staff: data,
      };

      return this.response.success(result, 200, 'Successfully retrieve staff');
    } catch (error) {
      console.log(error);
      return this.response.fail(error.message, 400);
    }
  }

  async findOne(id: number) {
    try {
      const staff = await this.staffModel.findOne({
        where: { id },
        include: [
          {
            association: 'branch',
            required: false,
          },
          {
            association: 'user',
          },
        ],
      });
      return this.response.success(staff, 200, ' Successfully get staff');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
