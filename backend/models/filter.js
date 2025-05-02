'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Filter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Filter.hasMany(models.FilterOption, {
        foreignKey: 'FilterId',
        as: 'FilterOptions'
      });
    }
  }
  Filter.init({
    label: DataTypes.STRING,
    icon: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Filter',
  });
  return Filter;
};