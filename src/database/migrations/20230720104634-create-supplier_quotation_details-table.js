'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('supplier_quotation_details', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        supplier_quotation_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'supplier_quotations',
            key: 'id',
          },
        },
        product_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        price_per_unit: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
        },
        total: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
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
    await queryInterface.dropTable('supplier_quotation_details');
  },
};
