var funs = require("../router/funs.js");
var express = require("express");
var router = express.Router();
var client_device = require("../middleware/header");
var signup = require("./controller/user-signup");
var login = require("./controller/user-login");
var logout = require("./controller/logout");

router.use(client_device);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("*", (req, res) => {
  res.status(404).json({ error: "true", message: "Seems A Wrong Path" });
});
module.exports = router;

io.on("connection", function (socket, err) {
  if (err) throw err;

  console.log("user connected");

  socket.on("join", function (username, email, password, gender, mobile) {
    DB_pool.getConnection(function (err, db) {
      if (err) throw err; // not connected!
      funs.registration(socket, db, username, email, password, gender, mobile);
    });
  });

  socket.on("FRIEND_OPERATION", function (
    userid,
    friend,
    All,
    invite,
    accept,
    reject,
    del
  ) {
    DB_pool.getConnection(function (err, db) {
      if (err) throw err; // not connected!
      funs.FRIEND_OPERATION(
        socket,
        db,
        userid,
        friend,
        All,
        invite,
        accept,
        reject,
        del
      );
    });
  });

  socket.on("GET_USER", function (userid, hist) {
    console.log("get user ", hist);
    DB_pool.getConnection(function (err, db) {
      if (err) throw err; // not connected!
      funs.GET_USER(socket, db, userid, hist);
    });
  });

  socket.on("PUBLIC_FEEDS", function (userid) {
    console.log("user is in feeds");
    DB_pool.getConnection(function (err, db) {
      if (err) throw err; // not connected!
      funs.PUBLIC_FEEDS(socket, db, userid);
    });
  });

  socket.on("UPLOAD_DP", function (userid, buffer) {
    console.log("i Got here");
    funs.UPLOAD_DP(socket, userid, buffer);
  });

  socket.on("Logout", function (userid) {
    funs.Logout(socket);
  });

  socket.on("disconnect", function () {
    console.log("has left ");
    funs.Logout(socket);
    console.log("Logged Out Successfully");
  });
});
