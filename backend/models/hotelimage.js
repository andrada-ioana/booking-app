'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HotelImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      HotelImage.belongsTo(models.Hotel, { foreignKey: 'HotelId', as: 'hotel' });
    }
  }
  HotelImage.init({
    image_url: DataTypes.STRING,
    HotelId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'HotelImage',
  });
  return HotelImage;
};