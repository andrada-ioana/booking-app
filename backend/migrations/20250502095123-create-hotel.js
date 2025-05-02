'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Hotels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      number_of_stars: {
        type: Sequelize.INTEGER
      },
      location: {
        type: Sequelize.STRING
      },
      location_maps: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.TEXT
      },
      cover_image: {
        type: Sequelize.STRING
      },
      price_per_night: {
        type: Sequelize.INTEGER
      },
      video_url: {
        type: Sequelize.STRING
      },
      video: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Hotels');
  }
};