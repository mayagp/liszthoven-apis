// import { HttpStatus, Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/sequelize';
// import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
// import { ResponseHelper } from 'src/helpers/response.helper';
// import { S3Helper } from 'src/helpers/s3.helper';
// import { User } from './entities/user.entity';
// import { StaffUnit } from './entities/staff-unit.entity';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { AssignStaffDto } from '../staff/dto/assign-staff.dto';
// import { Sequelize } from 'sequelize-typescript';

// @Injectable()
// export class UserService {
//   constructor(
//     private response: ResponseHelper,
//     private sequelize: Sequelize,
//     @InjectModel(StaffUnit) private staffUnitModel: typeof StaffUnit,
//   ) {}

//   async profile(user: User) {
//     return this.response.success(
//       user,
//       HttpStatus.OK,
//       'Successfully get profile',
//     );
//   }

//   async findAll(query: any) {
//     const { count, data } = await new QueryBuilderHelper(User, query)
//       .load('staff')
//       .getResult();

//     const result = {
//       count: count,
//       users: data,
//     };

//     return this.response.success(result, 200, 'Successfully retrieve users');
//   }

//   async findOne(id: number) {
//     try {
//       const teacherSchedule = await User.findOne({
//         where: { id: id },
//         include: [
//           {
//             association: 'staff',
//             include: [{ association: 'teacher' }],
//           },
//         ],
//       });
//       return this.response.success(
//         teacherSchedule,
//         200,
//         'Successfully get user',
//       );
//     } catch (error) {
//       return this.response.fail(error, 400);
//     }
//   }

//   async update(id: number, updateStaffProfileSchema: UpdateUserDto) {
//     const transaction = await this.sequelize.transaction();
//     try {
//       const user = await User.findByPk(id, {
//         include: ['staff'],
//       });

//       if (!user) {
//         return this.response.fail('User not found', 404);
//       }

//       const { staff, ...userData } = updateStaffProfileSchema;
//       await user.update(userData, { transaction: transaction });
//       if (
//         typeof updateStaffProfileSchema.staff !== 'undefined' &&
//         user.staff !== null
//       ) {
//         const staffData = staff;
//         await user.staff.update(staffData, { transaction: transaction });
//       }

//       await transaction.commit();
//       return this.response.success(user, 200, 'Successfully update user');
//     } catch (error) {
//       await transaction.rollback();
//       return this.response.fail('Failed update user', 400);
//     }
//   }

//   async assignStaff(id: number, assignStaffDto: AssignStaffDto) {
//     const transaction = await this.sequelize.transaction();
//     try {
//       const staffUnits: Promise<StaffUnit>[] = [];
//       for (const branch of assignStaffDto.branches) {
//         const staffUnit = await this.staffUnitModel.findOne({
//           where: {
//             staff_id: id,
//             branch_id: branch.id,
//           },
//         });

//         if (!staffUnit) {
//           const createStaffUnit = this.staffUnitModel.create(
//             {
//               staff_id: id,
//               branch_id: branch.id,
//             },
//             { transaction: transaction },
//           );

//           staffUnits.push(createStaffUnit);
//         }
//       }

//       await Promise.all(staffUnits);
//       await transaction.commit();

//       const staff = await this.staffUnitModel.findOne({
//         where: { id: id },
//         include: [{ association: 'branch' }],
//       });
//       return this.response.success(staff, 200, 'Successfully assign staff');
//     } catch (error) {
//       await transaction.rollback();
//       return this.response.fail(error, 400);
//     }
//   }

//   async removeStaff(id: number, removeStaffDto: AssignStaffDto) {
//     const transaction = await this.sequelize.transaction();
//     try {
//       for (const branch of removeStaffDto.branches) {
//         const staffUnit = await this.staffUnitModel.findOne({
//           where: {
//             staff_id: id,
//             branch_id: branch.id,
//           },
//         });

//         if (staffUnit) {
//           await this.staffUnitModel.destroy({
//             where: {
//               staff_id: id,
//               branch_id: branch.id,
//             },
//             transaction: transaction,
//           });
//         }
//       }

//       await transaction.commit();
//       return this.response.success({}, 200, 'Successfully remove staff');
//     } catch (error) {
//       await transaction.rollback();
//       return this.response.fail(error, 400);
//     }
//   }

//   async deleteUser(id: number) {
//     const user = await User.findByPk(id, {
//       include: ['staff'],
//     });

//     if (!user) {
//       return this.response.fail('User not found', 404);
//     }

//     if (user.staff) {
//       await user.staff.destroy();
//     }

//     await user.destroy();
//     return this.response.success(user, 200, 'Successfully delete user');
//   }
// }

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { AssignStaffDto } from '../staff/dto/assign-staff.dto';
import { UpdateUserAdminDto } from './dto/update-user.admin.dto';
import { StaffUnit } from './entities/staff-unit.entity';
import { User } from './entities/user.entity';
import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class UserService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(StaffUnit) private staffUnitModel: typeof StaffUnit,
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
      .load('staff.branches') // Sesuaikan dengan relasi baru
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
            include: [{ association: 'branches' }],
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
            include: [{ association: 'branches' }],
          },
        ],
      });

      if (!user) return this.response.fail('User not found', 404);

      const { staff, ...userData } = updateUserDto;

      await user.update(userData, { transaction });

      if (staff && user.staff) {
        await user.staff.update(staff, { transaction });
      }

      await transaction.commit();
      return this.response.success(user, 200, 'Successfully update user');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }

  async assignStaff(id: number, assignStaffDto: AssignStaffDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const staffUnits: Promise<StaffUnit>[] = [];

      for (const branch of assignStaffDto.branch) {
        const exists = await this.staffUnitModel.findOne({
          where: {
            staff_id: id,
            branch_id: branch.id,
          },
        });

        if (!exists) {
          staffUnits.push(
            this.staffUnitModel.create(
              {
                staff_id: id,
                branch_id: branch.id,
              },
              { transaction },
            ),
          );
        }
      }

      await Promise.all(staffUnits);
      await transaction.commit();

      const staff = await this.staffUnitModel.findAll({
        where: { staff_id: id },
        include: [{ model: Branch }],
      });

      return this.response.success(staff, 200, 'Successfully assign staff');
    } catch (error) {
      await transaction.rollback();
      return this.response.fail(error, 400);
    }
  }

  async removeStaff(id: number, removeStaffDto: AssignStaffDto) {
    const transaction = await this.sequelize.transaction();
    try {
      for (const branch of removeStaffDto.branch) {
        await this.staffUnitModel.destroy({
          where: {
            staff_id: id,
            branch_id: branch.id,
          },
          transaction,
        });
      }

      await transaction.commit();
      return this.response.success({}, 200, 'Successfully remove staff');
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
