'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, remove the foreign key constraint
    await queryInterface.removeConstraint('hotelfacilities', 'hotelfacilities_ibfk_2');

    // Then remove all existing facilities
    await queryInterface.bulkDelete('Facilities', null, {});

    // Add unique constraint to name column
    await queryInterface.addConstraint('Facilities', {
      fields: ['name'],
      type: 'unique',
      name: 'facilities_name_unique'
    });

    // Re-add the foreign key constraint
    await queryInterface.addConstraint('hotelfacilities', {
      fields: ['facilityId'],
      type: 'foreign key',
      name: 'hotelfacilities_ibfk_2',
      references: {
        table: 'Facilities',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraint
    await queryInterface.removeConstraint('hotelfacilities', 'hotelfacilities_ibfk_2');

    // Remove unique constraint
    await queryInterface.removeConstraint('Facilities', 'facilities_name_unique');

    // Re-add the foreign key constraint
    await queryInterface.addConstraint('hotelfacilities', {
      fields: ['facilityId'],
      type: 'foreign key',
      name: 'hotelfacilities_ibfk_2',
      references: {
        table: 'Facilities',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
}; 