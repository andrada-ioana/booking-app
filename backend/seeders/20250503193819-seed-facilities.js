'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Facilities', [
      { name: 'Free Wi-Fi', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Swimming Pool', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Spa', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gym', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Restaurant', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bar', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Parking', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pet Friendly', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Airport Shuttle', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Room Service', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Facilities', null, {});
  }
};
