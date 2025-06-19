'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('purchase_invoice_details', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        purchase_invoice_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'purchase_invoices',
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
        remaining_quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        unit_price: {
          type: Sequelize.DECIMAL(16, 2),
          allowNull: false,
          defaultValue: 0,
        },
        subtotal: {
          type: Sequelize.DECIMAL(16, 2),
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
    await queryInterface.dropTable('purchase_invoice_details');
  },
};
