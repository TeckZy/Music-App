module.exports = (req, res, next) => {
  req.ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
  req.device = "android";
  req.client = req.header("x-client-token");
  req.token = req.header("x-auth-token");
  next();
};
