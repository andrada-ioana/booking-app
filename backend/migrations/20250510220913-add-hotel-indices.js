'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('Hotels', ['number_of_stars']);
    await queryInterface.addIndex('Hotels', ['price_per_night']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Hotels', ['number_of_stars']);
    await queryInterface.removeIndex('Hotels', ['price_per_night']);
  }
};
