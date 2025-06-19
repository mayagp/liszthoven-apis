import { Injectable } from '@nestjs/common';
import { CreateSerializeItemDto } from './dto/create-serialize-item.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { SerializeItem } from './entities/serialize-item.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class SerializeItemService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(SerializeItem)
    private serializeItemModel: typeof SerializeItem,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.serializeItemModel,
      query,
    ).getResult();

    const result = {
      count: count,
      serialize_items: data,
    };

    return this.response.success(
      result,
      200,
      'Successfully retrieve serialize items',
    );
  }

  async findOne(id: number) {
    try {
      const serializeItem = await this.serializeItemModel.findOne({
        where: { id },
      });
      return this.response.success(
        serializeItem,
        200,
        ' Successfully get serialize item',
      );
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createSerializeItemDto: CreateSerializeItemDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const serializeItem = await this.serializeItemModel.create(
        {
          ...createSerializeItemDto,
        },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(
        serializeItem,
        200,
        'Successfully create serialize item',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create serialize item', 400);
    }
  }

  async update(id: number, updateSerializeItemDto: CreateSerializeItemDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const serializeItem = await this.serializeItemModel.findOne({
        where: { id: id },
      });
      if (!serializeItem) {
        await transaction.rollback();
        return this.response.fail('Serialize item not found', 404);
      }
      await serializeItem.update(updateSerializeItemDto, {
        transaction: transaction,
      });
      await transaction.commit();
      return this.response.success(
        serializeItem,
        200,
        'Successfully update serialize item',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update serialize item', 400);
    }
  }

  async delete(id: number) {
    const transaction = await this.sequelize.transaction();
    try {
      await this.serializeItemModel.destroy({
        where: { id },
        transaction: transaction,
      });

      await transaction.commit();
      return this.response.success(
        {},
        200,
        'Successfully delete serialize item',
      );
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }
}
