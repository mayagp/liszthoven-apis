'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'plan_implements',
        {
          id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            primaryKey: true,
          },
          purchase_plan_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
              model: 'purchase_plans',
              key: 'id',
            },
          },
          quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          planable_type: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          planable_id: {
            type: Sequelize.BIGINT,
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
        },
        { transaction }, // ⬅️ PENTING
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error); // ⬅️ BIAR KETAHUAN
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('plan_implements');
  },
};
