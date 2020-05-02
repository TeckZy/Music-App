module.exports = (error, request, response, next) => {
  if (error) {
    return response
      .status(500)
      .json({ error: "true", message: "Internal Server Error[MA]" });
  }
  return next();
};
