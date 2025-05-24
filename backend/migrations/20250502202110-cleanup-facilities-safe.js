'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First, try to remove the foreign key constraint if it exists
      await queryInterface.removeConstraint('hotelfacilities', 'hotelfacilities_ibfk_2');
    } catch (error) {
      console.log('Constraint hotelfacilities_ibfk_2 does not exist, continuing...');
    }

    // Then remove all existing facilities
    await queryInterface.bulkDelete('Facilities', null, {});

    try {
      // Try to add unique constraint to name column
      await queryInterface.addConstraint('Facilities', {
        fields: ['name'],
        type: 'unique',
        name: 'facilities_name_unique'
      });
    } catch (error) {
      console.log('Constraint facilities_name_unique already exists, continuing...');
    }

    try {
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
    } catch (error) {
      console.log('Failed to add foreign key constraint, continuing...');
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove foreign key constraint if it exists
      await queryInterface.removeConstraint('hotelfacilities', 'hotelfacilities_ibfk_2');
    } catch (error) {
      console.log('Constraint hotelfacilities_ibfk_2 does not exist, continuing...');
    }

    try {
      // Remove unique constraint if it exists
      await queryInterface.removeConstraint('Facilities', 'facilities_name_unique');
    } catch (error) {
      console.log('Constraint facilities_name_unique does not exist, continuing...');
    }

    try {
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
    } catch (error) {
      console.log('Failed to add foreign key constraint, continuing...');
    }
  }
}; 