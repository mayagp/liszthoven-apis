import { Injectable } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Branch } from './entities/branch.entity';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class BranchService {
  constructor(
    private readonly response: ResponseHelper,
    private readonly sequelize: Sequelize,
    @InjectModel(Branch)
    private readonly branchModel: typeof Branch,
  ) {}

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(
      this.branchModel,
      query,
    ).getResult();

    const result = {
      count: count,
      branches: data,
    };

    return this.response.success(result, 200, 'Successfully retrieve branches');
  }

  async findOne(id: number) {
    try {
      const branches = await this.branchModel.findOne({
        where: { id },
        include: [
          { association: 'province' },
          { association: 'city' },
          { association: 'subdistrict' },
        ],
      });
      return this.response.success(branches, 200, ' Successfully get branch');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async create(createBranchDto: CreateBranchDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const branch = await this.branchModel.create(
        { ...createBranchDto },
        { transaction: transaction },
      );
      await transaction.commit();
      return this.response.success(branch, 200, 'Successfully create branch');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to create branch', 400);
    }
  }

  async update(id: number, updateBranchDto: CreateBranchDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const branch = await this.branchModel.findOne({
        where: { id },
        // include: [{ association: 'branches' }],
      });

      // Tambahkan pengecekan null
      if (!branch) {
        await transaction.rollback();
        return this.response.fail('Branch not found', 404);
      }

      await branch.update(updateBranchDto, { transaction });
      await transaction.commit();
      return this.response.success(branch, 200, 'Successfully update branch');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail('Failed to update branch', 400);
    }
  }

  async delete(id: number) {
    try {
      await this.branchModel.destroy({
        where: { id },
      });
      return this.response.success({}, 200, ' Successfully delete branch');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }
}
