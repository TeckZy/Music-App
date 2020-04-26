var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
const CODE = require('./../utils/constants')

const sequelize = new Sequelize(CODE.SQL_DB, CODE.SQL_USER, CODE.SQL_PASSWORD, {
    host:CODE.SQL_HOST,
    dialect:  CODE.DB_TYPE ,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

var db = {};
// console.log(sequelize, __dirname)

fs.readdirSync(__dirname)
  .filter(function(file) {
    return file.indexOf(".") !== 0 && file !== "index.js";
  })
  .forEach(function(file) {
      console.log(file);
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  console.log(db[modelName])
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

//Custom Relation
db.User.hasMany(db.Auth);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;