const jwt = require("jsonwebtoken");
const CODE = require("./../utils/constants");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      device_type: {
        type: DataTypes.ENUM("ios", "android", "web"),
      },
      email: {
        type: DataTypes.STRING(255),
        unique: true,
      },
      mobile: {
        type: DataTypes.STRING(255),
      },
      password: {
        type: DataTypes.STRING(255),
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_mobile_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      image: {
        type: DataTypes.STRING(255),
      },
    },
    {
      freezeTableName: true, // Model tableName will be the same as the model name
      underscored: true,
    }
  );
  User.prototype.generateAuthToken = function () {
    const token = jwt.sign(
      { id: this.id, name: this.name, email: this.email },
      CODE.JWT_SECRET,
      { expiresIn: "1w" }
    );
    return token;
  };
  User.associate = function (models) {
    User.hasMany(models.Auth, {
      as: "auth",
    });
  };

  return User;
};
