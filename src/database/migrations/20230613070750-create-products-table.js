'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.TINYINT,
      },
      base_price: {
        type: Sequelize.DECIMAL(12, 2),
      },
      status: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
      },
      valuation_method: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
      },
      product_category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'product_categories',
          key: 'id',
        },
      },
      brand: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // brand_id: {
      //   type: Sequelize.BIGINT,
      //   allowNull: false,
      //   references: {
      //     model: 'brands',
      //     key: 'id',
      //   },
      // },
      quantity: {
        type: Sequelize.INTEGER,
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
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('products');
  },
};
