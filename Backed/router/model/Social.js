const jwt = require("jsonwebtoken");
const CODE = require("./../utils/constants");

module.exports = (sequelize, DataTypes) => {
  const Social = sequelize.define(
    "Social",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      from: {
        type: DataTypes.INTEGER,
      },
      to: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
      },
    },
    {
      timestamps: true,
      freezeTableName: true, // Model tableName will be the same as the model name
      underscored: true,
    }
  );
  Social.associate = function (models) {
    Social.belongsTo(models.User, {
      foreignKey: "from",
      as: "sender",
    });
    Social.belongsTo(models.User, {
      foreignKey: "to",
      as: "receiver",
    });
  };
  return Social;
};
