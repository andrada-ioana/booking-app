'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hotel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Hotel.belongsToMany(models.Facility, { through: 'HotelFacilities', as: 'facilities', foreignKey: 'HotelId' });
      Hotel.hasMany(models.HotelImage, { foreignKey: 'HotelId', as: 'images' });
    }
  }
  Hotel.init({
    name: DataTypes.STRING,
    number_of_stars: DataTypes.INTEGER,
    location: DataTypes.STRING,
    location_maps: DataTypes.TEXT,
    description: DataTypes.TEXT,
    cover_image: DataTypes.STRING,
    price_per_night: DataTypes.INTEGER,
    video_url: DataTypes.STRING,
    video: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Hotel',
  });
  return Hotel;
};