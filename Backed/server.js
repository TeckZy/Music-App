var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var common = require("./middleware/global");
var db = require("./router/model/index");
var auth = require("./middleware/auth");
var logger = require("./middleware/logger");
var error = require("./middleware/error");
var cors = require("cors");
var swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");
var mysql = require("mysql");
var app = express();
var port = process.env.PORT || 8080;
global.rootDir = __dirname + "/public";

var DB_pool = mysql.createPool({
  connectionLimit: 5,
  host: "remotemysql.com",
  user: "twp9tYJ7yN",
  password: "s2DMiOo8ML",
  database: "twp9tYJ7yN",
});
global.DB_pool = DB_pool;

var server = app.listen(port, function () {
  console.log("app started on :" + port);
});
require("./socket").init(server);
app.use(cors());
app.use(session({ secret: "ssshhhhh", saveUninitialized: true, resave: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(error, common, auth);
app.use(express.static(__dirname + "/public"));

// start the server

// ----------DataBase Syncronization-------------- //
db.sequelize.sync({});
// db.sequelize.sync({ force: true }); // for Only Replaceing Databse;
var router = require("./router/routes");
app.use(logger);

app.use("/api", router);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("*", (req, res) => {
  res.status(404).json({ error: "true", message: "Seems A Wrong Path" });
});
