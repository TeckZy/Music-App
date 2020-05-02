Logout = async (req, res) => {
  if (req.isAuthenticated) {
    const user = await db.User.findOne({
      where: {
        id: req.userId,
      },
    });
    user.access_token = "";
    user.device_token = "";
    await userFound.save({ fields: ["access_token", "device_token"] });
    await userFound.reload();
    return res.status(200).send({
      error: "false",
      message: "Logout Successfull",
    });
  } else {
    return res.status(404).send({
      error: "true",
      message: "You must be logged in to logout ",
    });
  }
};
module.exports = Logout;
