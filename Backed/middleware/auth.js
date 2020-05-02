const jwt = require("jsonwebtoken");
const db = require("./../router/model/index");

module.exports = async (req, res, next) => {
  console.log(req.client, req.token);
  if (req.token && req.client) {
    const userFound = await db.Auth.findOne({
      where: {
        access_token: req.token,
      },
      include: ["user"],
    });
    if (userFound) {
      req.user = userFound.user.toJSON();
      req.isAuthenticated = true;
      console.log(req.user, req.isAuthenticated);
    } else {
      req.user = {};
      req.isAuthenticated = false;
    }
  }
  next();
};
