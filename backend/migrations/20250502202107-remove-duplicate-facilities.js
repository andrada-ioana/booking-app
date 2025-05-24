'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get all unique facility names
    const [uniqueFacilities] = await queryInterface.sequelize.query(
      `SELECT DISTINCT name FROM Facilities;`
    );

    // For each unique facility name, keep only one instance
    for (const facility of uniqueFacilities) {
      // Get all IDs for this facility name
      const [duplicates] = await queryInterface.sequelize.query(
        `SELECT id FROM Facilities WHERE name = ? ORDER BY id ASC;`,
        {
          replacements: [facility.name],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      // Keep the first one, delete the rest
      if (duplicates.length > 1) {
        const idsToDelete = duplicates.slice(1).map(d => d.id);
        await queryInterface.sequelize.query(
          `DELETE FROM Facilities WHERE id IN (?);`,
          {
            replacements: [idsToDelete],
            type: Sequelize.QueryTypes.DELETE
          }
        );
      }
    }

    // Add unique constraint to name column
    await queryInterface.addConstraint('Facilities', {
      fields: ['name'],
      type: 'unique',
      name: 'facilities_name_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove unique constraint
    await queryInterface.removeConstraint('Facilities', 'facilities_name_unique');
  }
}; 