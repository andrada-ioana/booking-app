'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('HotelImages', {
      fields: ['HotelId'],
      type: 'foreign key',
      name: 'HotelImages_HotelId_fkey',
      references: {
        table: 'Hotels',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('HotelImages', 'HotelImages_HotelId_fkey');
  }
};
