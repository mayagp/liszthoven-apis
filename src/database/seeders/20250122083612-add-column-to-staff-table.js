'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('staff', 'bank_name', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'working_since',
    });

    await queryInterface.addColumn('staff', 'bank_account_number', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'bank_name',
    });

    await queryInterface.addColumn('staff', 'bank_account_name', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'bank_account_number',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('staff', 'bank_name');
    await queryInterface.removeColumn('staff', 'bank_account_number');
    await queryInterface.removeColumn('staff', 'bank_account_name');
  },
};
