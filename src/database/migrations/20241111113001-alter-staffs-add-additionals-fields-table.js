'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    await queryInterface.addColumn(
      'staff',
      'identification_number',
      {
        type: Sequelize.STRING,
        after: 'role',
        allowNull: true,
      },
      { transaction },
    );
    await queryInterface.addColumn(
      'staff',
      'tax_number',
      {
        type: Sequelize.STRING,
        after: 'identification_number',
        allowNull: true,
      },
      { transaction },
    );
    await queryInterface.addColumn(
      'staff',
      'bpjs_number',
      {
        type: Sequelize.STRING,
        after: 'tax_number',
        allowNull: true,
      },
      { transaction },
    );
    await queryInterface.addColumn(
      'staff',
      'working_since',
      {
        type: Sequelize.DATE,
        after: 'bpjs_number',
        allowNull: true,
      },
      { transaction },
    );
    await queryInterface.addColumn(
      'staff',
      'basic_salary',
      {
        type: Sequelize.DECIMAL(16, 2),
        allowNull: true,
        after: 'working_since',
      },
      { transaction },
    );
    // await queryInterface.addColumn(
    //   'staff',
    //   'marital_status',
    //   {
    //     type: Sequelize.TINYINT,
    //     after: 'birth_date',
    //     allowNull: true,
    //   },
    //   { transaction },
    // );
    await queryInterface.addColumn(
      'staff',
      'religion',
      {
        type: Sequelize.TINYINT,
        after: 'basic_salary',
        allowNull: true,
      },
      { transaction },
    );
    await queryInterface.addColumn(
      'staff',
      'status',
      {
        type: Sequelize.TINYINT,
        after: 'religion',
        allowNull: true,
      },
      { transaction },
    );
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    await queryInterface.removeColumn('staff', 'identification_number', {
      transaction,
    });
    await queryInterface.removeColumn('staff', 'tax_number', { transaction });
    await queryInterface.removeColumn('staff', 'bpjs_number', { transaction });
    await queryInterface.removeColumn('staff', 'working_since', {
      transaction,
    });
    await queryInterface.removeColumn('staff', 'basic_salary', {
      transaction,
    });
    await queryInterface.removeColumn('staff', 'religion', { transaction });
  },
};
