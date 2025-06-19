'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('purchase_order_details', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        quotation_no: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        supplier_quotation_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'supplier_quotations',
            key: 'id',
          },
        },
        purchase_order_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'purchase_orders',
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
        quantity_ordered: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        remaining_quantity: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        quantity_received: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        price_per_unit: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        total: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
          defaultValue: 0,
        },
        expected_delivery_date: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        status: {
          type: Sequelize.TINYINT,
          allowNull: false,
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
    await queryInterface.dropTable('purchase_order_details');
  },
};
