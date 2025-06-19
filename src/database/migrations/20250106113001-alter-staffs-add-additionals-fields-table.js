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
      'status',
      {
        type: Sequelize.TINYINT,
        after: 'working_since',
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
  },
};
