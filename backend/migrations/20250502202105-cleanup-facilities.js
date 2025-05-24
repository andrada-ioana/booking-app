'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Delete all facilities
    await queryInterface.bulkDelete('Facilities', null, {});
  },

  async down(queryInterface, Sequelize) {
    // No down migration needed as this is a cleanup
  }
}; 