 var waterfall = require('async-waterfall');
var md5 = require('md5');

var index = require('./server.js');
var Clients = index.Clients;
var Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs'));

var app = index.app;

function download(token,Touser,Fromuser,Fname){
	app.all("/"+token, (req, res) => {
		console.log("someone called Download!");
		if (!fs.existsSync(__dirname+"/users/"+Fromuser.toString()+"/Media/"+Touser.toString())){
			fs.mkdirSync(__dirname+"/users/"+Fromuser.toString()+"/Media/"+Touser.toString());
			}
		const file = fs.createWriteStream(__dirname+"/users/"+Fromuser.toString()+"/Media/"+Touser.toString()+"/"+Fname);
		req.pipe(file);
	

	});
	
	
}

function upload(token,Fromuser,Touser,Fname){
	
app.all("/"+token, (req, res) => {
console.log("someone called Upload!");
if (!fs.existsSync(__dirname+"/users/"+Fromuser.toString()+"/Media/"+Touser.toString())){
	fs.mkdirSync(__dirname+"/users/"+Fromuser.toString()+"/Media/"+Touser.toString());
	}
	var file = __dirname+"/users/"+Fromuser.toString()+"/Media/"+Touser.toString()+"/"+Fname;
	var rStream = fs.createReadStream(file);
	rStream.pipe(res).on("end", function () {
        rStream.close();// makesure stream closed, not close if download aborted.
		console.log("UPLOAD Stream Destroyed");
        fs.unlink(file, (err) => {
		  if (err) throw err;
		  console.log(file+' ===> was deleted');
		});
    });
	//rStream.end();
});
	
}

io.on('connection', function(socket) {
console.log('user connected');
setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

	
	socket.on('SEND_MESSAGE', (fromID,ToID,ContactFrom,nameFrom,msgId,msg,media,f_name,token,ack) => {
	
		var response = new Object();
		function getChat(){
					return new Promise(function(resolve, reject) {
						// The Promise constructor should catch any errors thrown on
						// this tick. Alternately, try/catch and reject(err) on catch.
						if(media){
							download(token,ToID,fromID,f_name);
						
								response = {"error":"false",'From':fromID,"nameFrom":nameFrom,"ContactFrom":ContactFrom,'ToID':ToID,'MessageID':msgId,"F_Name":f_name,'Media':media};
								return resolve(response);
								
							
						}else{
							response = {"error":"false",'From':fromID,"nameFrom":nameFrom,"ContactFrom":ContactFrom,'ToID':ToID,'MessageID':msgId,'Message':msg,'Media':media};
							return resolve(response);
						}
					});
				}
				
				ack({'MessageID':msgId,"Media":media,"token":token,"UseridTo":ToID});
				console.log("ack sent");
				getChat().then(function(response){
				
						let sock = io.sockets.connected[Clients[ToID.toString()]];
						sock.emit("CHAT_PACKET_RESPONSE",response,function (data){
							console.log("Reciept",data);
							if(response.Media && response.F_Name){
								var token = data.Token;
								console.log("-->",token,response.From,response.ToID,response.F_Name);
								upload(token,response.From,response.ToID,response.F_Name);
								console.log("Event Opened");								
							}
							socket.emit("SENT_MESSAGE_RECIEPT",{"error":false,'MsgReciept':true,'MessageID':data.MessageID,'useridTO':data.useridTO});
							
						});
						
					});
		
		
	});



});