'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const facilities = [
      { name: 'WiFi', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Swimming Pool', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gym', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Restaurant', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Spa', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Parking', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Room Service', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bar', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Conference Room', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Business Center', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Airport Shuttle', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pet Friendly', createdAt: new Date(), updatedAt: new Date() }
    ];

    try {
      // First, clear existing facilities
      await queryInterface.bulkDelete('Facilities', null, {});
      
      // Then insert new facilities
      await queryInterface.bulkInsert('Facilities', facilities, {
        ignoreDuplicates: true
      });
    } catch (error) {
      console.error('Error seeding facilities:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Facilities', null, {});
  }
}; 