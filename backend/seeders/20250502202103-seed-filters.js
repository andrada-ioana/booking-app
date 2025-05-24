'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if filter already exists
    const existingFilters = await queryInterface.sequelize.query(
      `SELECT id FROM \`Filters\` WHERE label = 'Stars' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingFilters.length === 0) {
      // Insert the filter row only if it doesn't exist
      await queryInterface.bulkInsert('Filters', [{
        label: 'Stars',
        icon: 'IoBedOutline',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      // Retrieve the inserted filter's ID
      const [filter] = await queryInterface.sequelize.query(
        `SELECT id FROM \`Filters\` WHERE label = 'Stars' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Insert associated filter options
      await queryInterface.bulkInsert('FilterOptions', [
        { value: '1', FilterId: filter.id, createdAt: new Date(), updatedAt: new Date() },
        { value: '2', FilterId: filter.id, createdAt: new Date(), updatedAt: new Date() },
        { value: '3', FilterId: filter.id, createdAt: new Date(), updatedAt: new Date() },
        { value: '4', FilterId: filter.id, createdAt: new Date(), updatedAt: new Date() },
        { value: '5', FilterId: filter.id, createdAt: new Date(), updatedAt: new Date() }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FilterOptions', null, {});
    await queryInterface.bulkDelete('Filters', null, {});
  }
};