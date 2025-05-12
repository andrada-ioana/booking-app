module.exports = (sequelize, DataTypes) => {
  const UserLog = sequelize.define('UserLog', {
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  UserLog.associate = (models) => {
    UserLog.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return UserLog;
};
