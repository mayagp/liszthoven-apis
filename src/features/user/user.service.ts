import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { AssignStaffDto } from '../staff/dto/assign-staff.dto';
import { UpdateUserAdminDto } from './dto/update-user.admin.dto';
import { User } from './entities/user.entity';
import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class UserService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
  ) {}

  async profile(user: User) {
    return this.response.success(
      user,
      HttpStatus.OK,
      'Successfully get profile',
    );
  }

  async findAll(query: any) {
    const { count, data } = await new QueryBuilderHelper(User, query)
      .load('staff.branch') // Sesuaikan dengan relasi baru
      .getResult();

    return this.response.success(
      { count, users: data },
      200,
      'Successfully retrieve users',
    );
  }

  async findOne(id: number) {
    try {
      const user = await User.findOne({
        where: { id },
        include: [
          {
            association: 'staff',
          },
          {
            association: 'supplier',
          },
        ],
      });

      return this.response.success(user, 200, 'Successfully get user');
    } catch (error) {
      return this.response.fail(error, 400);
    }
  }

  async update(id: number, updateUserDto: UpdateUserAdminDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const user = await User.findByPk(id, {
        include: [
          {
            association: 'staff',
          },
          {
            association: 'supplier',
          },
        ],
      });

      if (!user) return this.response.fail('User not found', 404);

      const { staff, supplier, ...userData } = updateUserDto;

      await user.update(userData, { transaction });

      if (staff && user.staff) {
        await user.staff.update(staff, { transaction });
      }

      if (supplier && user.supplier) {
        await user.supplier.update(supplier, { transaction });
      }

      await transaction.commit();
      return this.response.success(user, 200, 'Successfully update user');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }

  async deleteUser(id: number) {
    const user = await User.findByPk(id, {
      include: ['staff'],
    });

    if (!user) {
      return this.response.fail('User not found', 404);
    }

    if (user.staff) {
      await user.staff.destroy();
    }

    await user.destroy();
    return this.response.success(user, 200, 'Successfully delete user');
  }
}
