// import { HttpStatus, Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { InjectConnection, InjectModel } from '@nestjs/sequelize';
// import * as bcrypt from 'bcrypt';
// import { Op } from 'sequelize';
// import { Sequelize } from 'sequelize-typescript';
// import { ResponseHelper } from 'src/helpers/response.helper';
// import { StaffUnit } from '../user/entities/staff-unit.entity';
// import { User } from '../user/entities/user.entity';
// import { UserService } from '../user/user.service';
// import { CreateUserDto } from '../user/dto/create-user.dto';
// import { Branch } from '../branch/entities/branch.entity';
// @Injectable()
// export class AuthService {
//   constructor(
//     private response: ResponseHelper,
//     private sequelize: Sequelize,
//     private jwtService: JwtService,
//     @InjectModel(User) private userModel: typeof User,
//     @InjectModel(StaffUnit) private staffUnitModel: typeof StaffUnit,
//     @InjectModel(Branch)
//     private userService: UserService,
//   ) {}

//   async login(user: any) {
//     const payload = { email: user.email, sub: user.id };
//     const result = {
//       user,
//       access_token: this.jwtService.sign(payload),
//     };
//     return this.response.success(result, 200);
//   }

//   async validateUser(username: string, password: string) {
//     try {
//       const user = await this.userModel.findOne({
//         where: { [Op.or]: { email: username, username: username } },
//         attributes: { include: ['password'] },
//       });

//       if (user) {
//         const isValid = await bcrypt.compare(password, user.password);
//         if (isValid) {
//           const result = user.toJSON();
//           delete result.password;
//           return result;
//         }
//       }

//       return false;
//     } catch (error) {
//       return this.response.fail(error, HttpStatus.BAD_REQUEST);
//     }
//   }

//   async validateJwt(id: number) {
//     const user = await this.userModel.findByPk(id, {
//       include: [
//         {
//           required: false,
//           association: 'staff',
//           include: [
//             {
//               association: 'branches',
//             },
//           ],
//         },
//       ],
//     });
//     return user;
//   }

//   async register(createUserDto: CreateUserDto) {
//     const transaction = await this.sequelize.transaction();
//     try {
//       createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
//       const user = await this.userModel.create(
//         { ...createUserDto },
//         {
//           include: [
//             {
//               association: 'staff',
//             },
//           ],
//           transaction: transaction,
//         },
//       );

//       // if (typeof createUserDto.staff !== 'undefined') {
//       //   const staffUnits: Promise<StaffUnit>[] = [];
//       //   for (const branch of createUserDto.staff.branches) {
//       //     staffUnits.push(
//       //       this.staffUnitModel.create(
//       //         {
//       //           branch_id: branch,
//       //           staff_id: user.staff.id,
//       //         },
//       //         { transaction: transaction },
//       //       ),
//       //     );
//       //   }

//       //   await Promise.all(staffUnits);
//       // }
//       // await transaction.commit();

//       const getUser = await this.userModel.findOne({
//         where: { id: user.id },
//         include: [
//           {
//             association: 'staff',
//             include: [{ association: 'branches' }],
//           },
//         ],
//       });
//       return this.response.success(
//         getUser,
//         HttpStatus.OK,
//         'Successfully register user',
//       );
//     } catch (error) {
//       await transaction.rollback();
//       return this.response.fail(error.message, HttpStatus.BAD_REQUEST);
//     }
//   }
// }

import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { ResponseHelper } from 'src/helpers/response.helper';
import UserRoleEnum from '../staff/enums/user-role.enum';
import { User } from '../user/entities/user.entity';
import { Sequelize } from 'sequelize-typescript';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Staff } from '../staff/entities/staff.entity';
import { Supplier } from '../supplier/entities/supplier.entity';

@Injectable()
export class AuthService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    private jwtService: JwtService,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Staff) private staffModel: typeof Staff,
    @InjectModel(Supplier) private supplierModel: typeof Supplier,
    private usersService: UserService,
  ) {}

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const result = {
      user,
      access_token: this.jwtService.sign(payload),
    };
    return this.response.success(result, 200);
  }

  async validateUser(username: string, password: string) {
    try {
      const user = await this.userModel.findOne({
        where: { [Op.or]: { email: username, username: username } },
        attributes: { include: ['password'] },
        include: [
          {
            association: 'staff',
            include: [
              {
                association: 'branch',
                required: false,
              },
            ],
          },
          {
            association: 'supplier',
            required: false,
          },
        ],
      });

      if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          const result = user.toJSON();
          delete result.password;

          if (!user.staff && !user.supplier) {
            return false;
          }
          return result;
        }
      }

      return false;
    } catch (error) {
      return this.response.fail(error, HttpStatus.BAD_REQUEST);
    }
  }

  async validateJwt(id: number) {
    const user = await this.userModel.findByPk(id, {
      include: [
        {
          required: true,
          association: 'staff',
          include: [
            {
              association: 'branch',
              required: false,
            },
          ],
        },
        {
          association: 'supplier',
          required: false,
        },
      ],
    });
    return user;
  }

  async register(createUserDto: CreateUserDto) {
    const transaction = await this.sequelize.transaction();
    let committed = false;

    try {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.userModel.create(
        { ...createUserDto },
        { transaction },
      );

      let staff;

      if (createUserDto.staff) {
        staff = await this.staffModel.create(
          {
            ...createUserDto.staff,
            user_id: user.id,
            branch_id: createUserDto.staff.branch_id,
          },
          { transaction },
        );
      }

      let supplier;

      if (createUserDto.supplier) {
        supplier = await this.supplierModel.create(
          {
            ...createUserDto.supplier,
            user_id: user.id,
          },
          { transaction },
        );
      }

      await transaction.commit();
      committed = true;

      const getUser = await this.userModel.findOne({
        where: { id: user.id },
        include: [
          {
            association: 'staff',
            required: false,
            include: [{ association: 'branch', required: false }],
          },
          {
            association: 'supplier',
            required: false,
          },
        ],
      });

      return this.response.success(
        getUser,
        HttpStatus.OK,
        'Successfully register user',
      );
    } catch (error) {
      if (!committed) {
        await transaction.rollback();
      }
      return this.response.fail(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
