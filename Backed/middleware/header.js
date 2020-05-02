module.exports = function (req, res, next) {
  if (!req.client)
    return res.status(401).json({
      error: true,
      Message: "Unknown CLient Please Provide a CLient Token ",
    });
  next();
};
