'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('supplier_quotations', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        quotation_no: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        supplier_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'suppliers',
            key: 'id',
          },
        },
        date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        expected_delivery_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        status: {
          type: Sequelize.TINYINT,
          allowNull: false,
        },
        subtotal: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
          defaultValue: 0,
        },
        tax: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
          defaultValue: 0,
        },
        grandtotal: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
          defaultValue: 0,
        },
        note: {
          type: Sequelize.STRING,
          allowNull: true,
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
    await queryInterface.dropTable('supplier_quotations');
  },
};
