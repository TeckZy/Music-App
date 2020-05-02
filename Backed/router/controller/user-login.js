const Joi = require("joi");
const db = require("./../model/index");

const CODE = require("../utils//constants");
const jwt = require("jsonwebtoken");
const md5 = require("md5");

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(req, schema);
}

const Login = async (req, res) => {
  const { error } = validate(req.body);

  if (error)
    return res
      .status(400)
      .send({ error: "true", message: error.details[0].message });

  const user = await db.User.findOne({
    where: {
      email: req.body.email,
      password: md5(req.body.password),
    },
    include: ["auth"],
  });
  if (!user)
    return res
      .status(400)
      .send({ error: "true", message: "Invalid Email Or Password" });

  if (user.auth.length > 0) {
    token = await oldUserLogin(user, req);
    return token ? success(token) : ISR();
  } else {
    token = await newUserLogin(user, req);
    return token ? success(token) : ISR();
  }

  function success(token) {
    return res.status(200).send({
      error: "false",
      message: "Login Successfull",
      body: { token: token },
    });
  }
  function ISR() {
    return res.status(500).send({
      error: "false",
      message: "Internal Server Error [LF]",
    });
  }
};

module.exports = Login;

async function oldUserLogin(user, req) {
  const [first] = user.auth.slice(0, 1);
  try {
    return jwt.verify(
      first.access_token,
      CODE.JWT_SECRET,
      async (err, decoded) => {
        if (!err) return first.access_token;
        else {
          first.access_token = user.generateAuthToken();
          first.device_token = req.header("client-token");
          await first.save();
          console.log(first.access_token);
          return first.access_token;
        }
      }
    );
  } catch (e) {
    return null;
  }
}
async function newUserLogin(user, req) {
  try {
    const token = user.generateAuthToken();
    const auth = await db.Auth.build({
      access_token: token,
      device_token: "req.client",
      device_type: "android",
      ip_address: "1111",
      user_id: user.id,
    });
    await auth.save();
    return token;
  } catch (e) {
    return false;
  }
}
