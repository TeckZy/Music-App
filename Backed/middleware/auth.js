const jwt = require("jsonwebtoken");
const db = require("./../router/model/index");

module.exports = async (req, res, next) => {
  if (req.token && req.client) {
    const userFound = await db.User.findOne({
      where: {
        access_token: req.token,
      },
    });
    if (userFound) {
      if (userFound.device_token == req.client) {
        req.isAuthenticated = true;
        req.userId = userFound.id;
      } else {
        req.isAuthenticated = false;
        userFound.access_token = "";
        userFound.device_token = "";
        await userFound.save({ fields: ["access_token", "device_token"] });
        await userFound.reload();
        return res.status(403).send({
          error: "true",
          message: "Token Invalidated ! Please Login Again ",
        });
      }
    } else {
      req.isAuthenticated = false;
    }
  }

  console.log(req.isAuthenticated, "Status");
  next();
};
