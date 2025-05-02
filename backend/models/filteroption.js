'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FilterOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FilterOption.belongsTo(models.Filter, {
        foreignKey: 'FilterId',
        as: 'Filter'
      });
    }
  }
  FilterOption.init({
    value: DataTypes.STRING,
    FilterId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'FilterOption',
  });
  return FilterOption;
};