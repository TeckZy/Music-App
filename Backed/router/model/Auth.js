// const { Sequelize, Model, DataTypes } = require('sequelize');
// class User extends Model { }
const jwt = require("jsonwebtoken");
module.exports = (sequelize, DataTypes) => {
const Auth = sequelize.define('Auth',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id:{
        type: DataTypes.STRING(255),
        allowNull: false,

    },
    access_token: {
        type: DataTypes.STRING(255),
    },
    device_token: {
        type: DataTypes.STRING(255),
    },
    device_type: {
        type: DataTypes.ENUM('ios', 'android', 'web'),
    },
    ip_address: {
        type: DataTypes.STRING(255),
    },
},{
    freezeTableName: true,
    timestamps: false,
    underscored: true
  })

return Auth;

}
