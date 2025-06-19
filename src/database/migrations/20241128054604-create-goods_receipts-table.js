'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('goods_receipts', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        purchase_invoice_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'purchase_invoices',
            key: 'id',
          },
        },
        goods_receipt_no: {
          type: Sequelize.STRING,
          allowNull: true,
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
        warehouse_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'warehouses',
            key: 'id',
          },
        },
        date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        note: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.TINYINT,
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
    await queryInterface.dropTable('goods_receipts');
  },
};
