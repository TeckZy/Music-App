
// require our dependencies
var express        = require('express');
//var expressLayouts = require('express-ejs-layouts');
var bodyParser     = require('body-parser');
var md5 =  require('md5');
var session 	   = require('express-session')
const Sequelize = require('sequelize');
var mysql 		   = require('mysql');
var app            = express();
var ioSerer =  require('./socket');
// ioSerer.init(app)
var http = require('http').createServer(app);
//const io = require('socket.io').listen(http);
var port           = process.env.PORT || 8080;
global.rootDir = __dirname+"/public";


var DB_pool = mysql.createPool({
  connectionLimit : 5,
  host     : 'remotemysql.com',
  user     : 'twp9tYJ7yN',
  password : 's2DMiOo8ML',
  database : 'twp9tYJ7yN'
});
global.DB_pool = DB_pool;
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
// set static files (css and images, etc) location
app.use(express.static(__dirname + '/public'));

// start the server
var server = app.listen(port, function() {
  console.log('app started on :'+ port);
});
var io = require("socket.io")(server);
global.io = io;


//custom logger

var logger  = require('./middleware/logger');
var db  = require("./router/model/index");
var client_device =  require("./middleware/header");
var auth = require('./middleware/auth');



db.sequelize.sync({});// route our app
// db.sequelize.sync({force:true});
var router = require('./router/routes');
app.use(logger);
app.use(client_device);
app.use(auth);

app.use('/', router);
app.use('/port', function(req, res, next) {
  res.send('Chat Server is running on port '+port);
});














