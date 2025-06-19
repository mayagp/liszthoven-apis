'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('purchase_payment_allocations', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        purchase_payment_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'purchase_payments',
            key: 'id',
          },
        },
        purchase_invoice_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'purchase_invoices',
            key: 'id',
          },
        },
        amount_allocated: {
          type: Sequelize.DECIMAL(16, 2),
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
    await queryInterface.dropTable('purchase_payment_allocations');
  },
};
