module.exports = (sequelize, DataTypes) => {
  const MonitoredUser = sequelize.define('MonitoredUser', {
    reason: DataTypes.STRING,
  });

  MonitoredUser.associate = (models) => {
    MonitoredUser.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return MonitoredUser;
};
