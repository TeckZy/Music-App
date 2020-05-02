const db = require("./../model/index");
Logout = async (req, res) => {
  if (req.isAuthenticated) {
    const userFound = await db.Auth.findOne({
      where: {
        access_token: req.token,
      },
    });
    try {
      (userFound.access_token = ""),
        (userFound.device_token = ""),
        await userFound.save({ fields: ["access_token", "device_token"] });
      await userFound.reload();
      return res.status(200).send({
        error: "false",
        message: "Logout Successfull",
      });
    } catch (e) {
      return res.status(500).send({
        error: "false",
        message: "Internel Server Error [LO]",
      });
    }
  } else {
    return res.status(404).send({
      error: "true",
      message: "You must be logged in to logout ",
    });
  }
};
module.exports = Logout;
