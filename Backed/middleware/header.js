module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  const client = req.header("client-token");
  console.log(JSON.stringify(req.headers));

  if (!client)
    return res.status(401).json({
      error: true,
      Message: "Unknown CLient Please Provide a CLient Token ",
    });
  req.client = client;
  req.token = token;
  next();
};
