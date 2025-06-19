'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('serialize_items', {
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
      inventory_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'inventories',
          key: 'id',
        },
      },
      serial_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      warranty_end_date: {
        type: Sequelize.DATE,
      },
      is_sold: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('serialize_items');
  },
};
