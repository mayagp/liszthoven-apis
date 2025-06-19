'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('purchase_invoices', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        invoice_no: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        purchase_order_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'purchase_orders',
            key: 'id',
          },
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
        due_date: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        status: {
          type: Sequelize.TINYINT,
          allowNull: false,
        },
        subtotal: {
          type: Sequelize.DECIMAL(16, 2),
          allowNull: true,
          defaultValue: 0,
        },
        tax: {
          type: Sequelize.DECIMAL(16, 2),
          allowNull: true,
          defaultValue: 0,
        },
        shipping_cost: {
          type: Sequelize.DECIMAL(16, 2),
          allowNull: true,
          defaultValue: 0,
        },
        grandtotal: {
          type: Sequelize.DECIMAL(16, 2),
          allowNull: true,
          defaultValue: 0,
        },
        remaining_amount: {
          type: Sequelize.DECIMAL(16, 2),
          allowNull: true,
          defaultValue: 0,
        },
        note: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        branch_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'branches',
            key: 'id',
          },
        },
        created_by: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_by: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
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
    await queryInterface.dropTable('purchase_invoices');
  },
};
