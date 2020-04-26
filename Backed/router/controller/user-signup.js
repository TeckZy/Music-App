var md5 = require("md5");
var db = require("./../model/index"); 

var Signup =  async(req, res, next) => {
  console.log("Header", req.header('client-token'))
    const userFound = await db.User.findAll({
        where: {
          email: req.body.email
        }
      });

      let user = await db.User.build({
        name: req.body.name,
        email: req.body.email,
        password: md5(req.body.password),
        device_type: req.body.device_type ? req.body.device_type: 'android',
        mobile: req.body.mobile ? req.body.mobile: '',
        status : false,
        is_mobile_verified: false,
        is_email_verified: false,
        image: 'null'
      });

      if (userFound.length != 0) return res.status(404).send({"error":"true","message":"User Already Exists"});

      user = await user.save();
      const token = user.generateAuthToken();
      user.access_token = token;
      user.device_token =  req.header('client-token');
      await user.save({ fields: ['access_token','device_token'] });
      await user.reload();
      res.header("x-auth-token", token ).header('client-token',req.header('client-token')).status(200).send({"error":"false","message":"User Created Successful"})
};

module.exports = Signup;

