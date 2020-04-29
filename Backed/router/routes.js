// require express
var funs = require('../router/funs.js');
var api = require('../router/API_FUNC.js');
var express = require('express');
var path = require('path');
var signup = require('./controller/user-signup');
var login = require('./controller/user-login');
// create our router object
var router = express.Router();
// export our router
module.exports = router;

//-------------------------------------Starting middleWare function--------------------------------------------------//
router.get('/', function(req, res, next) {
  res.send('Chat Server is running');
});

router.get('/login', (req, res, next)=> {
	DB_pool.getConnection((err, db)=> {
		if (err) return res.json({"Error" : true, "Message" : "Connection Failed"});
		if (req.body.email  &&  req.body.password){
			api.login(db,req.body.email,req.body.password,"req.Device","req.ipAddress",(usr)=>{
				res.send(usr);
			});
		 }
		else{
			return res.status(400).json({"Error" : true, "Message" : "User and Password is Required"})
		}
	});
  });


  router.post('/api/signup',signup );
  router.post('/api/login',login );
  router.use('*', function(req, res){
	res.status(404).json({"Error" : true, "Message" : "Page Not Found"})
  });


//-----------------------------------------Socket.io--------------------------------------------------------------//
//see if a user is connecting
io.on('connection', function(socket,err) {
if (err) return res.status(400).json({"Error" : true, "Message" : "Socket Connection Failed"})


// socket.on('join', function(username,email,password,gender,mobile) {
	
// 		DB_pool.getConnection(function(err, db) {
// 			if (err) throw err; // not connected!
					
// 				funs.registration(socket,db,username,email,password,gender,mobile);
			
// 		});

		

        
//     });
	
//---------------------------------------Login---------------------------------------------------------------------------------//

// socket.on('Login', function(email,password,Device,ipAddress) {
//  console.log('user login');
// 	DB_pool.getConnection(function(err, db) {
// 		if (err) throw err; // not connected!
		
// 			funs.login(socket,db,email,password,Device,ipAddress);

// 	});
	

        
// });

socket.on('DP_QUERY',function(idsforimg){
	
	funs.DP_QUERY(socket,idsforimg);
});



//----------------------------------current-----------------------------------------------------------------------------------//
socket.on('CURRENT_SONG_UPDATE', function(songName,userid,songAlbum,songArtist,songDuration) {
	console.log("Current called");
	DB_pool.getConnection(function(err, db) {
		if (err) throw err; // not connected!
		console.log("Current called 0");
		funs.CURRENT_SONG_UPDATE(socket,db,songName,userid,songAlbum,songArtist,songDuration);
		
	});

        
});

//-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

//-------------------------------------------------------userHistory---------------------------------------------------------------//

socket.on('userHistory', function(userid,name,password,profile) {
	
	
	
	DB_pool.getConnection(function(err, db) {
		if (err) throw err; // not connected!
		funs.userHistory(socket,db,userid,name,password,profile);
		
		
	});
	
	

        
});


//-------------------------------------------------------************---------------------------------------------------------------//

socket.on('FRIEND_OPERATION', function(userid,friend,All,invite,accept,reject,del) {

	
	DB_pool.getConnection(function(err, db) {
		if (err) throw err; // not connected!
			funs.FRIEND_OPERATION(socket,db,userid,friend,All,invite,accept,reject,del);
		
	});
	
	
});


socket.on('PROGRESS_UPDATER',function(userid,progress){
	
	DB_pool.getConnection(function(err, db) {
		if (err) throw err; // not connected!
			funs.PROGRESS_UPDATER(socket,db,userid,progress);
		
		
	});
	
	
});


socket.on('GET_USER',function(userid,hist){
	console.log("get user ",hist);
	DB_pool.getConnection(function(err, db) {
		if (err) throw err; // not connected!
		funs.GET_USER(socket,db,userid,hist);
	});
	
	
});




socket.on('PUBLIC_FEEDS',function(userid){
	console.log("user is in feeds");
	DB_pool.getConnection(function(err, db) {
		if (err) throw err; // not connected!
		funs.PUBLIC_FEEDS(socket,db,userid);
	 });
	
	
});


 socket.on('UPLOAD_DP', function(userid,buffer) {
	 console.log('i Got here');
	 funs.UPLOAD_DP(socket,userid,buffer);
	 
});

	
socket.on('Logout', function(userid) {  
	   funs.Logout(socket);
});


socket.on('disconnect', function() {
        console.log('has left ');
		funs.Logout(socket);
		console.log("Logged Out Successfully");
			
		
		

    });


});
