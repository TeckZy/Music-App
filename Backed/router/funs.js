var Clients = new Object();
var md5    = require('md5');
var Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs'));
var response = {};
module.exports = {
  login: function (socket,db,email,password,Device,ipAddress) {
    var st = "true";
	var now = new Date();
	var date = now.toLocaleDateString();
	var time = now.toLocaleTimeString();
	var datetime = date+"//"+time;
	var source = "Android";
	var query1= "select * from log_in WHERE Email='"+email+"' and Password='"+password+"'";
	var user = [];
	var idsforimg = [];
	
	db.query(query1, function (err, result) {
		console.log(query1);
				if (err) throw err;
					if(result.length > 0){
						var usr = result[0].Id;
						var res = Clients[usr.toString()];
						if(res === undefined){
								user = JSON.parse(JSON.stringify(result));
								var logincount =result[0].LoginCount;
								var logincount = logincount+1;
								var roomstojoin = [];
								var clientstoget = [];
						
							var query = "update log_in set LastLoginDateTime='"+datetime+"',CurrentStatus='"+st+"',CurrentLoginFrom='"+Device+"',LoginCount='"+logincount+"' where Email='"+email+"'";
							db.query(query, function (err, result){
								if (err) throw err;
								if(result.affectedRows > 0){
										console.log("user "+user[0].Id);
									
										socket.userid = user[0].Id;
										var userid = socket.userid;
										roomstojoin.push(socket.userid);
										Clients[userid.toString()] = socket.id;
										idsforimg.push(socket.userid);
										
										// fetch the main id of friend's socket to make him join you
										
										module.exports.getFriends(socket,db,idsforimg,roomstojoin).then(function(){
											db.release();
											response = {"userid":socket.userid};
											socket.to(socket.userid).emit("NOTIFY",response);
											response = {"error":"false","user":user,"OnFriends":roomstojoin,"message":"Logged in Successfully"};
											socket.emit("LOGIN_RESPONSE",response);
											
										});
									
						
								}else{
									console.log("Error: "+err);
								}
							});
					
					}else{
						console.log("either id is online or is not logged out earlier");
						
					}
					
				}else{
					console.log("user Doesnt exist");
					response = {"error":true,"message":"User Not Found"};
					socket.emit("LOGIN_RESPONSE",response);
				}
			});
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  getFriends: function (socket,db,idsforimg,roomstojoin) {
		return new Promise(function(resolve, reject) {
		query1 = "SELECT * FROM friendships INNER JOIN log_in ON friendships.UseridTo = log_in.Id WHERE friendships.UseridFrom = '"+socket.userid+"'";
		 query = "SELECT * FROM friendships INNER JOIN log_in ON friendships.UseridFrom = log_in.Id WHERE friendships.UseridTo = '"+socket.userid+"' UNION "+query1+"";
			db.query(query, function (err, result) {
				if (err) throw err;
					if(result.length > 0){
						for(var i=0;i<result.length;i++){
							var id = result[i].Id;
							idsforimg.push(id);
							let sock = io.sockets.connected[Clients[id.toString()]];
							if(sock != undefined){
								console.log("defined");
								roomstojoin.push(id);
								
								sock.join(socket.userid);
							}
						
						}
						console.log('id '+socket.id);
						socket.join(roomstojoin);
						console.log('roomsjoined '+roomstojoin);
						
				}else{console.log("No friends found online");}		
			});
				
		return resolve();

		});
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  registration: function (socket,db,username,email,password,gender,mobile){
		var st1 = "false";
		var now = new Date();
		var date = now.toLocaleDateString();
		var time = now.toLocaleTimeString();
		password = md5(password);
		var source = "Android";
				
				db.beginTransaction(function(err) {
									if (err) { console.log("[mysql error]",err); }
									var query1 = "insert into log_in(Name,Mobile,Email,Password,LastLoginDateTime,LastLogoutDateTime,LoginCount,CurrentStatus,CurrentLoginFrom) values('"+
									username+"','"+
									mobile+"','"+
									email+"','"+password+"','0','0','0','"+st1+"','"+source+"')";
									
									db.query(query1, function (error, results, fields) {
										if (error) {
											if(error.errno==1062){
												response = {"error":true,"message":"User Already Existed"};
											}else{response = {"error":true,"message":"An Error Occurred"};}
											return db.rollback(function() {
												db.release();
												console.log("[mysql error]",error);
												
											});
										}

										var id = results.insertId;
										var log = 'Post ' + results.insertId + ' added';
										var query2 = "insert into user_accounts(Name,Gender,Mobile,Email,Password,Date_Time,Id) values('"+username+"','"+gender+"','"+mobile+"','"+email+"','"+password+"','"+date+"//"+time+"','"+id+"')"
										
										db.query(query2, function (error, results, fields) {
											if (error) {
												if(error.errno==1062){
												response = {"error":true,"message":"User Already Existed"};
											}else{response = {"error":true,"message":"An Error Occurred"};}
												return db.rollback(function() {
													db.release();
													console.log("[mysql error]",error);
								
												});
											}
											db.commit(function(err) {
												if (err) {
													return db.rollback(function() {
														db.release();
													console.log("[mysql error]",err);
													response = {"error":true,"message":"An Error Occurred"};
													});
												}
												console.log('success!');
												db.release();
												response = {"error":"false","message":"Account Created Successfully"};
												
											});
										});
									});
								});
								socket.emit("REG_RESPONSE",response);
				
		
	  
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  DP_QUERY: function(socket,idsforimg){
	  var friends_img = {};
	  console.log(idsforimg);
	Promise.each(idsforimg, function(item) {
		if (fs.existsSync('../users/'+item+'/USER_DP.jpg')){
			return fs.readFileAsync('../users/'+item+'/USER_DP.jpg').then(function(val){
					// do stuff with 'val' here. 
					var arrByte = val.toString('base64'); 
					console.log("friends ids to fetch dp"+item);
					console
					 friends_img[item] = arrByte;
					
				});
		}
	
	}).then(function() {
		response = {"error":"false","Friends_img":friends_img,"message":"Logged in Successfully"};
		socket.emit("DP_QUERY_RESPONSE",response);
				
	});
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  CURRENT_SONG_UPDATE: function(socket,db,songName,userid,songAlbum,songArtist,songDuration){
	  var now = new Date();
	var date = now.toLocaleDateString();
	var time = now.toLocaleTimeString();
	var datetime = date+"//"+time;

	var query= "select Email,Name from log_in WHERE Id='"+userid+"'";
	var songProgress =0;
	console.log("Current called 1");
	db.query(query, function (err, result) {
			if (err) throw err;
			if(result.length > 0){
				var Email =result[0].Email;
				var name = result[0].Name;
				console.log("Current called 2");
						query = "select times from history Where Song_name = '"+songName+"' AND  Song_artist = '"+songArtist+"' AND Song_album = '"+songAlbum+"' AND UserID = '"+userid+"' AND User_Email = '"+Email+"'";
						db.query(query, function(error,result) {
							if (err) throw err;
						//------------committing transaction for current When Duplicate Found----------------------------------------------------//
						console.log("Current called 3");
							db.beginTransaction(function(err) {
								if (err) { console.log("[mysql error]",err); }
								var query1;
								var query2;
								var counter
								if(result.length > 0){
									counter = result[0].times + 1;
									 query1 = "insert into currents(UserID,User_name,Song_name,Song_album,Song_artist,User_Email,song_duration,Song_progress,Date,Time) values('"+userid+"','"+name+"','"+songName+"','"+songAlbum+"','"+songArtist+"','"+Email+"','"+songDuration+"','"+songProgress+"','"+date+"','"+time+"')";
									 query2 = "update history set times = '"+counter+"' Where Song_name = '"+songName+"' AND  Song_artist = '"+songArtist+"' AND Song_album = '"+songAlbum+"' AND UserID = '"+userid+"' AND User_Email = '"+Email+"'";	
								}else{
									 query1 = "insert into currents(UserID,User_name,Song_name,Song_album,Song_artist,User_Email,song_duration,Song_progress,Date,Time) values('"+userid+"','"+name+"','"+songName+"','"+songAlbum+"','"+songArtist+"','"+Email+"','"+songDuration+"','"+songProgress+"','"+date+"','"+time+"')";
									 query2 = "insert into history(UserID,User_name,Song_name,Song_album,Song_artist,User_Email,song_duration,Song_progress,Date,Time,times) values('"+userid+"','"+name+"','"+songName+"','"+songAlbum+"','"+songArtist+"','"+Email+"','"+songDuration+"','"+songProgress+"','"+date+"','"+time+"','1')";	
								}
								
								db.query("DELETE FROM currents WHERE UserID="+userid+" AND User_Email = '"+Email+"'", function (error, results, fields) {
									if (error) {
									return db.rollback(function() {
										db.release();
										console.log("[mysql error]",error);
									});
									}
									
										db.query(query1, function (error, results, fields) {
												if (error) {
												return db.rollback(function() {
													db.release();
													console.log("[mysql error]",error);
												});
												}

												var log = 'Post ' + results.insertId + ' added';

												db.query(query2, function (error, results, fields) {
													if (error) {
														return db.rollback(function() {
															db.release();
														console.log("[mysql error]",error);
														});
													}
															db.commit(function(err) {
																if (err) {
																	return db.rollback(function() {
																		db.release();
																	console.log("[mysql error]",err);
																	});
																}
																
																	response = {"error":"false","message":"Updated"};
																	socket.emit("CURRENT_UPDATE_RESPONSE",response);
																	emitCurrentChange(socket,db,userid);	
																	db.release();
															});
												});
										});
									
								});
								
							});
					
					
					
						});
						
					
					

				
			}else{
				console.log("user Doesnt exist");
			}
			
		 
		  });
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  userHistory:  function(socket,db,userid,name,password,profile){
	  
	var user = [];
	
	var query= "select * from user_accounts where Id= "+userid+"";

	
	db.query(query, function (err, result) {
			if (err) throw err;
			if(result.length > 0 ){
				user = JSON.parse(JSON.stringify(result));
				if(profile == true){
					var response = {"error":"false","user":user,"message":"Fetched Successfully"};
					socket.emit("PROFILE_RESPONSE",response);
				}
				
				if(name || password){
					if(name && name != result[0].Name)
						{
							query="update user_accounts set Name = '"+name+"' Where Id = "+userid+"";
							db.query(query, function (err, result) {
								if (err) throw err;
								var response = {"error":"false","message":"Updated Successfully"};
								
							});
							
							
						}
						
					if(password && password != result[0].Password)
						{
							query="update user_accounts set Password = '"+Password+"' Where Id = "+userid+"";
							db.query(query, function (err, result) {
								if (err) throw err;
								var response = {"error":"false","message":"Updated Successfully"};
							});
						}
						
						socket.emit("PROFILE_RESPONSE",response);
					
					
				}else{
					
					query = "select * from history Where User_Email = '"+result[0].Email+"' AND UserID = "+result[0].Id+"";
					db.query(query, function (err, result) {
						if (err) throw err;
						if(result.length > 0 ){
							var hist = JSON.parse(JSON.stringify(result));
							var response = {"error":"false","user":user,"History":hist,"message":"Logged in Successfully"};
								socket.emit("HISTORY_RESPONSE",response);
								console.log(response)
							
						}
					});
					
				}
				
			}else {
				console.log("user Doesnt exist :"+query);
			}
			
			// When done with the connection, release it.
			console.log("no. of conn--> "+DB_pool._allConnections.length);
			db.release();
			console.log("no. of free conn--> "+DB_pool._freeConnections.length);
		});
	  
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  FRIEND_OPERATION: function(socket,db,userid,friend,All,invite,accept,reject,del){
	  var user = [];
	  var now = new Date();
	var date = now.toLocaleDateString();
	var time = now.toLocaleTimeString();
	var datetime = date+"//"+time;
	  if(invite == true){
			
			var query = "select * from log_in where Email = '"+friend+"' or Mobile = '"+friend+"'";
			db.query(query, function (err, result) {
				if (err) throw err;
				if(result.length > 0){
						var friend_id = result[0].Id;
						var query = "insert into friendships(UseridFrom,UseridTo,Date,Time,Accept,Reject) values('"+userid+"','"+friend_id+"','"+date+"','"+time+"','false','false')";
						db.query(query, function (err, result) {
							if (err) throw err;
							if(result.affectedRows > 0){
								response = {"error":"false","message":"Request Sent!"};
								socket.emit("INVITE_RESPONSE",response);
								getAllFriends(db,socket,userid);
								//To:Do Like Notifying user for friend request;
									
							}else{
								response = {"error":"true","message":"An Error Occured"};
								socket.emit("INVITE_RESPONSE",response);
						}
					
					
						});
					
					}else{
					response = {"error":"true","message":"User Not Found"};
					socket.emit("INVITE_RESPONSE",response);
					
				}
				
				// When done with the connection, release it.
				console.log("no. of conn--> "+DB_pool._allConnections.length);
				db.release();
				console.log("no. of free conn--> "+DB_pool._freeConnections.length);
			});
			
			
		}
		
		if(accept == true){

			var query = "select * from log_in where Email = '"+friend+"' or Mobile = '"+friend+"'";
			db.query(query, function (err, result) {
				if (err) throw err;
				if(result.length > 0){
						var friend_id = result[0].Id;
						console.log("res1 "+friend_id);
						query = "update friendships set Accept = '"+accept+"' Where UseridTo = '"+userid+"' AND UseridFrom = '"+friend_id+"'";
						db.query(query, function (err, result) {
							if (err) throw err;
							if(result.affectedRows > 0){
								console.log("res"+result.affectedRows);
								response = {"error":"false","message":"User Accepted"};
								socket.emit("ACCEPT_RESPONSE",response);
								getAllFriends(db,socket,userid);
								//To:Do Like Notifying user  that user accepted;
							}
							
							
						});

					}else{
					response = {"error":"true","message":"User Not Found"};
					socket.emit("ACCEPT_RESPONSE",response);
					
				}
				
				// When done with the connection, release it.
					console.log("no. of conn--> "+DB_pool._allConnections.length);
					db.release();
					console.log("no. of free conn--> "+DB_pool._freeConnections.length);
				});
			
		}
		
		if(All == true){
			
			getAllFriends(db,socket,userid);
			
		}
		
		
		if(reject == true){
			
			var query = "select * from log_in where Email = '"+friend+"' or Mobile = '"+friend+"'";
			db.query(query, function (err, result) {
				if (err) throw err;
				if(result.length > 0){
					var friend_id = result[0].Id;
					var query = "update friendships set Reject = '"+accept+"' Where UseridTo = '"+userid+"' AND UseridFrom = '"+friend_id+"'";
					db.query(query, function (err, result) {
						if (err) throw err;
						if(result.affectedRows > 0){
							response = {"error":"false","message":"User Rejected"};
							socket.emit("REJECT_RESPONSE",response);
							getAllFriends(db,socket,userid);
							//To:Do Like Notifying user  that user accepted;
						}
						
						
					});
				}else{
						response = {"error":"true","message":"User Not Found"};
						socket.emit("REJECT_RESPONSE",response);
				}
				// When done with the connection, release it.
				console.log("no. of conn--> "+DB_pool._allConnections.length);
				db.release();
				console.log("no. of free conn--> "+DB_pool._freeConnections.length);
			});
			
		}
		
		if(del == true){
			var query = "select * from log_in where Email = '"+friend+"' or Mobile = '"+friend+"'";
			db.query(query, function (err, result) {
				if (err) throw err;
				if(result.length > 0){
					var friend_id = result[0].Id;
					console.log("\n delete -->"+friend_id);
				var query = "DELETE FROM friendships Where (UseridFrom ="+userid+" AND UseridTo = "+friend_id+") OR( UseridFrom = "+friend_id+" AND UseridTo = "+userid+")";
				db.query(query, function (err, result) {
					if (err) throw err;
					if(result.affectedRows > 0){
						response = {"error":"false","message":"User Deleted"};
						socket.emit("DELETE_RESPONSE",response);
						getAllFriends(db,socket,userid);
						//To:Do Like Notifying user  that Friend Deleted;
					}
					
				});
				
				}else{
						response = {"error":"true","message":"User Not Found"};
						socket.emit("DELETE_RESPONSE",response);
				}
				
				// When done with the connection, release it.
				console.log("no. of conn--> "+DB_pool._allConnections.length);
				db.release();
				console.log("no. of free conn--> "+DB_pool._freeConnections.length);
			});
		}
	  
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  PROGRESS_UPDATER: function(socket,db,userid,progress){
	  query = "update currents set Song_progress = "+progress+" WHERE UserID = "+userid+"";
	db.query(query, function (err, result) {
		if (err) throw err;
		if(result.affectedRows > 0 ){
			var response = {"error":"false","userid":userid,"progress":progress,"message":"fetched Successfully"};
			
				io.in(socket.userid).emit("PROGRESS_RESPONSE", response);
			
		}
		db.release();
	});
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  GET_USER: function(socket,db,userid,hist){
	  
			function getUser()
				{
					return new Promise(function(resolve, reject) {
						// The Promise constructor should catch any errors thrown on
						// this tick. Alternately, try/catch and reject(err) on catch.
						query = "SELECT * FROM currents INNER JOIN (SELECT Id,Mobile from log_in WHERE Id = 1 ) b ON currents.UserID = b.Id WHERE UserID = "+userid+"";
						 
						  db.query(query, function (err, result) {
							if (err) return reject(err);
							console.log("get user result ",result); 
							if(result.length > 0 ){
								var curr = JSON.parse(JSON.stringify(result));
								response = {"error":false,"curr":curr,"message":"fetched Successfully"};
								console.log("GET_USER_Middle",response);	
								}
								return resolve(response);
							});
						
						});
				}
			
				getUser().then(function(response){
						return new Promise(function(resolve, reject) {
							if(hist){
								query = "sele * from history WHERE UserID = "+userid;
								db.query(query, function (err, result) {
									if (err) return reject(err);
									if(result.length > 0 ){
										var hist = JSON.parse(JSON.stringify(result));
										response["hist"] = hist; 
										
									}
									
									return resolve(response);
								});
								    
							  }else{
								  return resolve(response);
							  }
						});
						
						
					}).then(function(response){
						console.log("GET_USER",response);
						db.release();
						socket.emit("GET_USER_RESPONSE", response);
						
					});
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  PUBLIC_FEEDS: function(socket,db,userid){
	  var users = [];
	  console.log("user is in feeds2");
	  io.in(socket.userid).clients((err, clients) => {
			 if(clients !== undefined){
				  console.log("clients-> ",clients);
				  Promise.each(clients, function(s) {
					  let sock = io.sockets.connected[s];
					users.push(sock.userid);
				}).then(function(){
						var index = users.indexOf(socket.userid);
						/*if (index > -1) {
						  users.splice(index, 1);
						}*/
						console.log("in feeds "+users);
						if(users && users.length){
							
							
						var query = "SELECT * FROM currents WHERE UserID IN ("+users.toString()+")";
						console.log("Query",query);
									db.query(query, function (err, result) {
										if (err) throw err;
										if(result.length > 0 ){
											var curr_packet = JSON.parse(JSON.stringify(result));
											var response = {"error":"false","packet":curr_packet,"message":"fetched Successfully"};
											console.log("self feeds updated");
												socket.emit("RESPONSE_PUBLIC_FEEDS", response);
											
										}
										db.release();
									});
						
						}
					
					
				});
				
				 
			 }
			
		 });
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  UPLOAD_DP: function(socket,userid,buffer){
	  if (!fs.existsSync(__dirname+"/users/"+socket.userid)){
		fs.mkdirSync(__dirname+"/users/"+socket.userid);
		}
	   fs.writeFile(__dirname+'/users/'+socket.userid+'/USER_DP.jpg', buffer,{ flags: 'wx' },function (err) {
	  if (err) throw err;
	  console.log('Saved!');
	  fs.readFile(__dirname+'/users/'+socket.userid+'/USER_DP.jpg', function(err, data) {
		  if (err) throw err; // Fail if the file can't be read.
		  var arrByte = data.toString('base64'); 
		 response = {"error":"false","dp":arrByte,"message":"Display Pic Saved Successfully"};
		 //socket.emit("UPLOAD_DP",response);
		 io.in(socket.userid).emit('UPLOAD_DP_RESPONSE', response);
		});
	
	});
  },
  //-------------------------------------------------**********************************-----------------------------------------------------------------------------------//

  Logout: function(socket){
	  logout(socket);
  }
  
};

//-------------------------------------------------Starting Mannual Functions-----------------------------------------------------------------------------------//

function logout(socket){
//removing this client from all rooms

io.of('/').adapter.clientRooms(socket.id, (err, rooms) => {
  if (err) { /* unknown id */ }
 
  Promise.each(rooms, function(item) {socket.leave(item);console.log("Client has been Removed from Every Rooms");
  }).then(function(){
	 io.in(socket.userid).clients((err, clients) => {
		 if(clients && clients.length){
			  console.log("clients-> ",clients);
			 clients.forEach(function(s){
				 let sock = io.sockets.connected[s];
				sock.leave(socket.userid);
		});
			 
		 }
		console.log("Room is Empty now");
	 });
	}).then(function(){
		var usr = socket.userid;
		var deluser = usr.toString();
		if(undefined != Clients || null != Clients){
		delete Clients[deluser];
		}
		console.log("Logged Out Successfully"+Object.keys(Clients));
	});
});

	
}

function emitCurrentChange(socket,db,userid){
	
	var query = "select * from currents Where UserID = "+userid+"";
	
		db.query(query, function (err, result) {
			if (err) throw err;
			if(result.length > 0 ){
					console.log(result);
				var curr_packet = JSON.parse(JSON.stringify(result));
				var response = {"error":"false","packet":curr_packet,"message":"Music Changed Successfully"};
				console.log("current changes emitted"+response);
					// sending to all clients in 'game' room, except sender
					socket.to(socket.userid).emit("RESPONSE_PUBLIC_FEEDS", response);
				
			}
		});

}

function getAllFriends(db,socket,userid){
	var user = [];
	
	var query1 = "SELECT * FROM friendships INNER JOIN log_in ON friendships.UseridTo = log_in.Id WHERE friendships.UseridFrom = '"+userid+"'";
	var query = "SELECT * FROM friendships INNER JOIN log_in ON friendships.UseridFrom = log_in.Id WHERE friendships.UseridTo = '"+userid+"' UNION "+query1+"";
	db.query(query, function (err, result) {
			if (err) throw err;
			if(result.length > 0){
				user = JSON.parse(JSON.stringify(result));
				console.log(user);
				var response = {"error":"false","friends":user,"message":"Successfully fetched"};
				socket.emit("ALL_RESPONSE",response);
			}else{
				var response = {"error":"true","user":user,"message":"No Friends Found"};
				socket.emit("ALL_RESPONSE",response);
				
			}
	});

}