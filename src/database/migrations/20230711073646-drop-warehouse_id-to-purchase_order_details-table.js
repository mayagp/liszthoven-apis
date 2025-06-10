'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
        'purchase_order_details',
        'warehouse_id',
        {
          transaction,
        },
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'purchase_order_details',
        'warehouse_id',
        {
          type: Sequelize.BIGINT,
          allowNull: true,
          after: 'id',
          references: {
            model: 'warehouses',
            key: 'id',
          },
        },
        {
          transaction,
        },
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
