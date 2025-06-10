'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('suppliers', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        contact_no: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        pic: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        tax_no: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        total_payable: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('suppliers');
  },
};
