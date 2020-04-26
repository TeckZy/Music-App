const Joi = require("joi");
const db = require("./../model/index");

const  CODE =  require('../utils//constants')
const jwt = require("jsonwebtoken");
const md5 = require('md5');



function validate(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(req, schema);
}

const Login  =   async (req, res) => {

const { error } = validate(req.body);

if (error) return res.status(400).send({"error":"true","message":error.details[0].message});

  const user = await db.User.findOne({
    where: {
      email: req.body.email,
      password: md5(req.body.password),
    }
  });

  if (!user ) return res.status(400).send({"error":"true","message":"Invalid Email Or Password"});


  const token = user.access_token;

  if(!token){
   return generateNewToken(user);
  }

  try {
    jwt.verify(token,CODE.JWT_SECRET,(err ,decoded)=>{
      if(!err)   {
        return res.status(200).send({"error":"true","message":"Login Successfull",'body':{'token':token}});
        }else { 
          return  generateNewToken(user);
      }
    })

  } catch(e) {
    return res.status(400).send({"error":"true","message":"Token Expired"});
  }


  async function  generateNewToken(user){
    const token = user.generateAuthToken();
    user.access_token = token;
    user.device_token =  req.header('client-token');
    await user.save({ fields: ['access_token','device_token'] });
    await user.reload();
    return   res.status(200).send({"error":"false","message":"Login Successfull",'body':{'token': user.access_token }});
}

}

module.exports = Login;