import { Injectable } from '@nestjs/common';
import { CreateAutoNumberDto } from './dto/create-auto-number.dto';
import { InjectModel } from '@nestjs/sequelize';
import moment from 'moment';
import { Transaction } from 'sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { AutoNumber } from './entities/auto-number.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AutoNumberService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(AutoNumber)
    private autoNumberModel: typeof AutoNumber,
  ) {}

  async findAll(query: any) {
    try {
      const { count, data } = await new QueryBuilderHelper(
        this.autoNumberModel,
        query,
      ).getResult();

      const transaction = await this.sequelize.transaction();
      const auto_numbers: any[] = [];

      for (const item of data) {
        let autoNumberValue = '';
        try {
          autoNumberValue = await this.generateAutoNumber(
            item.table,
            transaction,
          );
        } catch (err) {
          console.error('generateAutoNumber error for table', item.table, err);
          autoNumberValue = 'ERROR';
        }

        // Tidak perlu toJSON(), langsung spread item
        auto_numbers.push({
          ...item,
          latest_auto_number: autoNumberValue,
        });
      }

      await transaction.rollback();

      return this.response.success(
        { count, auto_numbers },
        200,
        'Successfully retrieve auto numbers',
      );
    } catch (outerErr) {
      console.error('findAll error:', outerErr);
      return this.response.fail(outerErr.message || 'Unknown error', 500);
    }
  }

  async findOne(id: number) {
    try {
      const autoNumber = await this.autoNumberModel.findOne({
        where: { id },
      });
      return this.response.success(
        autoNumber,
        200,
        'Successfully get auto number',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createAutoNumberDto: CreateAutoNumberDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const getAutoNumber = createAutoNumberDto.format.filter(
        (value) => value.type === 'autonumber',
      );

      if (getAutoNumber.length < 1) {
        return this.response.fail(
          'Auto number format is required, only 1',
          400,
        );
      }

      if (getAutoNumber.length > 1) {
        return this.response.fail('Only 1 auto number format is allowed', 400);
      }

      const getDateFormat = createAutoNumberDto.format.filter(
        (value) => value.type === 'date',
      );

      if (getDateFormat.length > 1) {
        return this.response.fail('Only 1 date format is allowed', 400);
      }

      const autoNumber = await this.autoNumberModel.create(
        { ...createAutoNumberDto },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        autoNumber,
        200,
        'Successfully create auto number',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create auto number', 400);
    }
  }

  async update(id: number, updateAutoNumberDto: CreateAutoNumberDto) {
    const getAutoNumber = updateAutoNumberDto.format.filter(
      (value) => value.type === 'autonumber',
    );

    if (getAutoNumber.length < 1) {
      return this.response.fail('Auto number format is required, only 1', 400);
    }

    if (getAutoNumber.length > 1) {
      return this.response.fail('Only 1 auto number is allowed', 400);
    }

    const getDateFormat = updateAutoNumberDto.format.filter(
      (value) => value.type === 'date',
    );

    if (getDateFormat.length > 1) {
      return this.response.fail('Only 1 date format is allowed', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      const autoNumber = await this.autoNumberModel.findOne({
        where: { id: id },
        transaction: transaction,
      });
      if (!autoNumber) {
        await transaction.rollback();
        return this.response.fail('Auto Number not found', 404);
      }
      await autoNumber.update(updateAutoNumberDto, { transaction });
      await transaction.commit();
      return this.response.success(
        autoNumber,
        200,
        'Successfully update auto number',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update auto number', 400);
    }
  }

  async delete(id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      await this.autoNumberModel.destroy({
        where: { id },
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success({}, 200, 'Successfully delete auto number');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }

  async generateAutoNumber(
    tableName: string,
    transaction: Transaction,
  ): Promise<any> {
    try {
      const getConfig = await this.autoNumberModel.findOne({
        where: { table: tableName },
        transaction: transaction,
      });

      if (!getConfig) {
        return this.response.fail(
          'Auto number config for this feature is doesnt exists',
          400,
        );
      }

      let result = '';
      let lastNumber = getConfig.last_number;
      for (const format of getConfig.format) {
        if (format.type === 'autonumber') {
          const dateFormat = getConfig.format.find(
            (value) => value.type === 'date',
          );
          if (dateFormat) {
            const today = moment().format(dateFormat.value);
            const lastInputDate = moment(
              getConfig.getDataValue('updated_at'),
            ).format(dateFormat.value);

            if (lastInputDate !== today) {
              lastNumber = 0; // restart last_number if date is different
            }
          }

          await getConfig.update(
            { last_number: lastNumber + 1 },
            { transaction: transaction },
          ); // increase last_number by 1

          // get auto number format like 0001
          const getNumber = String(lastNumber + 1).padStart(+format.value, '0');

          result += getNumber;
        } else if (format.type === 'date') {
          result += moment().format(format.value);
        } else {
          result += format.value;
        }
      }

      return result;
    } catch (error) {
      console.log(error, 'hmmmmmm');
      throw error;
    }
  }
}
