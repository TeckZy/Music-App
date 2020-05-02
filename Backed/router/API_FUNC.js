var md5    = require('md5');
var mysql   = require("mysql");
var Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs'));
module.exports = {
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
}

}