import { Injectable } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { InjectModel } from '@nestjs/sequelize';
import { QueryBuilderHelper } from 'src/helpers/query-builder.helper';
import { ResponseHelper } from 'src/helpers/response.helper';
import { Branch } from '../branch/entities/branch.entity';
import { StaffUnit } from '../user/entities/staff-unit.entity';
import { User } from '../user/entities/user.entity';
import { Staff } from './entities/staff.entity';
import { getReligionEnums } from './enums/religion.enum';
import { getRoleTypeEnums } from './enums/staff-role.enum';
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
              association: 'branches',
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
            association: 'branch_id',
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

  // async importStaff(file: Express.Multer.File) {
  //   if (!file) {
  //     return this.response.fail('File is required', 400);
  //   }

  //   const transaction = await this.sequelize.transaction();
  //   try {
  //     if (
  //       ![
  //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  //         'text/csv', //csv
  //       ].includes(file.mimetype)
  //     ) {
  //       return this.response.fail(
  //         'Invalid file type, only xlsx and csv are allowed',
  //         400,
  //       );
  //     }

  //     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];
  //     const json = XLSX.utils.sheet_to_json(sheet, { blankrows: false });

  //     const userPayload = [];
  //     for (const row of json as Array<any>) {
  //       // validate username or email
  //       if (!row.username) {
  //         return this.response.fail('Username is required', 400);
  //       }

  //       const user = await User.findOne({
  //         where: { username: row.username },
  //         transaction,
  //       });

  //       if (user) {
  //         await user.update(
  //           { username: user.username + '_duplicate' },
  //           { transaction },
  //         );
  //         // return this.response.fail(
  //         //   `Username ${row.username} already exists`,
  //         //   400,
  //         // );
  //       }

  //       if (row.email !== null && row.email !== '' && row.email !== undefined) {
  //         const user = await User.findOne({
  //           where: { email: row.email },
  //           transaction,
  //         });

  //         if (user) {
  //           await user.update(
  //             { email: user.email + '_duplicate' },
  //             { transaction },
  //           );
  //           // return this.response.fail(`Email ${row.email} already exists`, 400);
  //         }
  //       }

  //       row.company ??= 'liszthoven';
  //       let branches = [];
  //       if (String(row.branch).includes(',')) {
  //         // remove space and split by comma
  //         branches = branches.concat(
  //           String(row.branch).replace(/\s/g, '').split(','),
  //         );
  //       } else {
  //         branches.push(row.branch);
  //       }

  //       const userBusinessUnits = [];
  //       for (const branchName of branches) {
  //         let businessUnit = await BusinessUnit.findOne({
  //           include: [
  //             {
  //               association: 'branch',
  //               where: { name: branchName },
  //               required: true,
  //             },
  //             {
  //               association: 'company',
  //               where: { name: row.company },
  //               required: true,
  //             },
  //           ],
  //         });

  //         if (!businessUnit) {
  //           const [branch, branchCreated] = await Branch.findOrCreate({
  //             where: { name: branchName },
  //             defaults: {
  //               name: branchName,
  //               address: '-',
  //             },
  //           });

  //           const [company, companyCreated] = await Company.findOrCreate({
  //             where: { name: row.company },
  //             defaults: {
  //               name: row.company,
  //               note: '-',
  //             },
  //           });

  //           businessUnit = await BusinessUnit.create({
  //             branch_id: branch.id,
  //             company_id: company.id,
  //           });
  //         }

  //         userBusinessUnits.push({
  //           business_unit_id: businessUnit.id,
  //         });
  //       }

  //       let teacherObject = {};
  //       if (String(row.role).toLowerCase().includes('teacher')) {
  //         const teacherType = getTeacherTypeEnums().find(
  //           (value) => String(value.name).toLowerCase() === row.type,
  //         );

  //         teacherObject = {
  //           teacher: {
  //             speciality: row.speciality,
  //             spoken_language: row.spoken_language,
  //             commission_percentage: row.commission_percentage,
  //             type: teacherType?.id ?? null,
  //           },
  //         };
  //       }

  //       const roles = row.role.toLowerCase().split(', ');
  //       let userRoles;
  //       if (roles.length > 1) {
  //         const role = roles.find(
  //           (value) => String(value).toLowerCase() !== 'teacher',
  //         );
  //         userRoles = getRoleTypeEnums().find(
  //           (value) => String(value.name).toLowerCase() === role,
  //         );
  //       } else {
  //         userRoles = getRoleTypeEnums().find(
  //           (value) => String(value.name).toLowerCase() === roles[0],
  //         );
  //       }

  //       const religion = getReligionEnums().find(
  //         (value) => String(value.name).toLowerCase() === row.religion,
  //       );

  //       let taxCategoryId = null;

  //       if (row.tax_category) {
  //         let taxCategory = await TaxCategory.findOne({
  //           where: { name: row.tax_category },
  //         });

  //         if (!taxCategory) {
  //           taxCategory = await TaxCategory.create({
  //             name: row.tax_category,
  //           });
  //         }

  //         taxCategoryId = taxCategory.id;
  //       }

  //       userPayload.push({
  //         first_name: row.name,
  //         phone_no: row.phone_no,
  //         username: row.username,
  //         password: await bcrypt.hash('123456', 10),
  //         gender: row.gender,
  //         address: row.address,
  //         staff: {
  //           basic_salary: row.basic_salary,
  //           identification_number: row.ktp_no,
  //           tax_number: row.npwp,
  //           role: userRoles?.id ?? null,
  //           bpjs_rate: row.bpjs_rate,
  //           working_since: new Date(row.working_since),
  //           birth_date: new Date(row.birth_date),
  //           birth_place: row.birth_place,
  //           religion: religion?.id ?? null,
  //           tax_category_id: taxCategoryId,
  //           bank_name: row.bank,
  //           bank_account_number: row.bank_account_number,
  //           bank_account_name: row.account_beneficiary_name,
  //           ...teacherObject,
  //         },
  //         user_business_units: userBusinessUnits,
  //       });
  //     }
  //     const users = await User.bulkCreate(userPayload, {
  //       include: [{ association: 'staff', include: ['teacher'] }],
  //       transaction,
  //     });

  //     const staffUnits = [];
  //     for (const user of users) {
  //       const userRawData = userPayload.find(
  //         (value) => value.username === user.username,
  //       );

  //       for (const businessUnit of userRawData.user_business_units) {
  //         staffUnits.push({
  //           staff_id: user.staff.id,
  //           business_unit_id: businessUnit.business_unit_id,
  //         });
  //       }
  //     }
  //     await StaffUnit.bulkCreate(staffUnits, {
  //       transaction,
  //     });

  //     await transaction.commit();
  //     return this.response.success(users, 200, 'Successfully import staff');
  //   } catch (error) {
  //     console.log(error);
  //     await transaction.rollback();
  //     return this.response.fail(error.message, 400);
  //   }
  // }
}
