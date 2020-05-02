var md5 = require("md5");
const Joi = require("joi");
var db = require("./../model/index");

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(100).required(),
    password: Joi.string().min(5).max(255).required(),
    name: Joi.string().min(6).max(100).required(),
  };

  return Joi.validate(req, schema);
}

var Signup = async (req, res, next) => {
  const { error } = validate(req.body);

  if (error)
    return res
      .status(400)
      .send({ error: "true", message: error.details[0].message });

  const userFound = await db.User.findAll({
    where: {
      email: req.body.email,
    },
  });

  if (userFound.length != 0)
    return res
      .status(404)
      .send({ error: "true", message: "User Already Exists" });

  let user = await db.User.build({
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password),
    device_type: req.body.device_type ? req.body.device_type : "android",
    mobile: req.body.mobile ? req.body.mobile : "",
    status: false,
    is_mobile_verified: false,
    is_email_verified: false,
    image: "null",
  });

  try {
    user = await user.save();
  } catch (e) {
    return res
      .status(err.code)
      .message({ error: true, message: err.sqlMessage });
  }

  return res
    .status(200)
    .send({ error: "false", message: "User Created Successful" });
};

module.exports = Signup;
