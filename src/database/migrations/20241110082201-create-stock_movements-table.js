'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('stock_movements', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
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
        },
        date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        from_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: {
            model: 'warehouses',
            key: 'id',
          },
        },
        to_id: {
          type: Sequelize.BIGINT,
          references: {
            model: 'warehouses',
            key: 'id',
          },
        },
        note: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        type: {
          type: Sequelize.TINYINT,
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
    await queryInterface.dropTable('stock_movements');
  },
};
