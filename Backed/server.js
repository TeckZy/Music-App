var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session')
var swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');
var mysql = require('mysql');
var app = express();
var ioSerer = require('./socket');
// ioSerer.init(app)
var http = require('http').createServer(app);
//const io = require('socket.io').listen(http);
var port = process.env.PORT || 8080;
global.rootDir = __dirname + "/public";


var DB_pool = mysql.createPool({
  connectionLimit: 5,
  host: 'remotemysql.com',
  user: 'twp9tYJ7yN',
  password: 's2DMiOo8ML',
  database: 'twp9tYJ7yN'
});
global.DB_pool = DB_pool;
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((error, request, response, next) => {
  if (error !== null && error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(500).json({ "error": "true", "message": "Internal Server Error" });
  }
  return next();
}); 

app.use(express.static(__dirname + '/public'));

// start the server
var server = app.listen(port, function () {
  console.log('app started on :' + port);
});
var io = require("socket.io")(server);
global.io = io;


//custom Middleware

var logger = require('./middleware/logger');
var db = require("./router/model/index");
var auth = require('./middleware/auth');



db.sequelize.sync({});// route our app
// db.sequelize.sync({force:true});
var router = require('./router/routes');
app.use(logger);
app.use(auth);

app.get('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1/', router);
app.get('*', (req, res) => {
  res.status(404).json({ "error": "true", "message": "Seems A Wrong Path" });
});

app.use('/port', function (req, res, next) {
  res.send('Chat Server is running on port ' + port);
});















