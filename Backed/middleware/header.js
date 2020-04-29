module.exports = function (req, res, next) {
    const token = req.header("x-auth-token");
    const client = req.header('client-token');
    if (!client) return res.status(401).json({"Error" : true, "Message" : "Client Not Idetified"});
    req.client =  client;
    req.token = token;
    next()
};