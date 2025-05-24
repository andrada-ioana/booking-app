'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, remove the foreign key constraint if it exists
    try {
      await queryInterface.removeConstraint('HotelFacilities', 'hotelfacilities_ibfk_2');
    } catch (error) {
      console.log('Foreign key constraint might not exist, continuing...');
    }

    // Get all facilities
    const facilities = await queryInterface.sequelize.query(
      'SELECT * FROM Facilities',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Group facilities by name
    const facilitiesByName = {};
    facilities.forEach(facility => {
      if (!facilitiesByName[facility.name]) {
        facilitiesByName[facility.name] = [];
      }
      facilitiesByName[facility.name].push(facility);
    });

    // For each group of duplicates, keep the one with the lowest ID
    for (const [name, duplicates] of Object.entries(facilitiesByName)) {
      if (duplicates.length > 1) {
        const keepId = duplicates[0].id;
        const deleteIds = duplicates.slice(1).map(f => f.id);

        // Update references in HotelFacilities
        await queryInterface.sequelize.query(
          'UPDATE HotelFacilities SET FacilityId = ? WHERE FacilityId IN (?)',
          {
            replacements: [keepId, deleteIds],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );

        // Delete duplicate facilities
        await queryInterface.bulkDelete('Facilities', {
          id: deleteIds
        });
      }
    }

    // Add unique constraint to name column if it doesn't exist
    try {
      await queryInterface.addConstraint('Facilities', {
        fields: ['name'],
        type: 'unique',
        name: 'facilities_name_unique'
      });
    } catch (error) {
      console.log('Unique constraint might already exist, continuing...');
    }

    // Re-add the foreign key constraint
    try {
      await queryInterface.addConstraint('HotelFacilities', {
        fields: ['FacilityId'],
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
      await queryInterface.removeConstraint('Facilities', 'facilities_name_unique');
    } catch (error) {
      console.log('Unique constraint might not exist, continuing...');
    }
  }
}; 