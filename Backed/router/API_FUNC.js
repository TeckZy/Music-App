var md5    = require('md5');
var mysql   = require("mysql");
var Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs'));
module.exports = {
    login:  (db,email,password,Device,ipAddress,callback)=> {
        var st = "true";
        var now = new Date();
        var date = now.toLocaleDateString();
        var time = now.toLocaleTimeString();
        var datetime = date+"//"+time;
        var source = "Android";
        var query = "SELECT * FROM ?? WHERE ??=? AND ??=?";
        var table = ["log_in","Password",  md5(password), "Email", email];
        query = mysql.format(query,table);


        var user = [];
        var idsforimg = [];
        var response = {};
        db.query(query,  (err, result) =>{
                    if (err) throw err;
                        if(result.length > 0){
                            var usr = result[0].Id;
                           // var res = Clients[usr.toString()];
                            if(usr !== undefined){
                                    user = JSON.parse(JSON.stringify(result));
                                    var logincount =result[0].LoginCount;
                                    var logincount = logincount+1;
                                    var roomstojoin = [];
                                    var clientstoget = [];
                                var query = "update log_in set LastLoginDateTime='"+datetime+"',CurrentStatus='"+st+"',CurrentLoginFrom='"+Device+"',LoginCount='"+logincount+"' where Email='"+email+"'";
                                db.query(query, function (err, result){
                                    if (err) throw err;
                                    if(result.affectedRows > 0){
                                        response = {"error":false,"message":"User Found","data":usr};
                                        return callback(response);
                                    }else{
                                        console.log("Error: "+err);
                                    }
                                });
                        
                        }else{
                            console.log("either id is online or is not logged out earlier");
                            
                        }
                        
                    }else{
                        response = {"error":true,"message":"User Not Found"};
                        return callback(response);
                    }
                });
      },
    registration: function (db,username,email,password,gender,mobile,callback){
        var response = {};
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
                                                return callback(response);
												
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
                                                    return callback(response);
								
												});
											}
											db.commit(function(err) {
												if (err) {
													return db.rollback(function() {
														db.release();
													console.log("[mysql error]",err);
													response = {"error":true,"message":"An Error Occurred"};
                                                    return callback(response);
                                                });
												}
												db.release();
												response = {"error":"false","message":"Account Created Successfully"};
												return callback(response);
											});
										});
									});
								});
				  
  },
  DP_QUERY: function(idsforimg){
    var friends_img = {};
    var response = {};
    console.log(idsforimg);
  Promise.each(idsforimg, function(item) {
      if (fs.existsSync('../users/'+item+'/USER_DP.jpg')){
          return fs.readFileAsync('../users/'+item+'/USER_DP.jpg').then(function(val){
                  // do stuff with 'val' here. 
                  var arrByte = val.toString('base64'); 
                   friends_img[item] = arrByte;
                  
              });
      }else{
        response = {"error":true,"message":"An Error Occurred"};
        return callback(response);
      }
  
  }).then(function() {
      response = {"error":"false","Friends_img":friends_img,"message":"Fetched Successfully"};
      return callback(response);
              
  });
},
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
                                                                 
                                                                  emitCurrentChange(socket,db,userid);	
                                                                  db.release();
                                                                  return response;
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
userHistory:  function(socket,db,userid,name,password,profile){

    var user = [];
    var response = {};
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
			
			
			db.release();
			
		});
	  
  }

}