'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, delete all filter options
    await queryInterface.bulkDelete('FilterOptions', null, {});
    
    // Then, delete all filters
    await queryInterface.bulkDelete('Filters', null, {});
  },

  async down(queryInterface, Sequelize) {
    // No down migration needed as this is a cleanup
  }
}; 