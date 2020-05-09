const jwt = require("jsonwebtoken");
const CODE = require('./../utils/constants');


module.exports = (sequelize, DataTypes) => {
const PendingRequest = sequelize.define('PendingRequest',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    from: {
        type: DataTypes.INTEGER,
    },
    to:{
        type: DataTypes.INTEGER,
    },
    status:{
        type: DataTypes.ENUM('Pending', 'approved', 'rejected'),
    },

},{
    timestamps: true,
    freezeTableName: true, // Model tableName will be the same as the model name
    underscored: true
  })
  PendingRequest.associate = function (models) {
    PendingRequest.belongsTo(models.User, {
      foreignKey: "from",
      as: "sender",
    });
    PendingRequest.belongsTo(models.User, {
        foreignKey: "to",
        as: "receiver",
      });
  };



return PendingRequest

}
