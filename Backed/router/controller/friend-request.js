const ACTION_LIST = [
  "ACCEPT_REQUEST",
  "VIEW_REQUEST",
  "SEND_REQUEST",
  "REJECT_REQUEST",
];

const db = require("./../model/index");

const FriendRequest = async (req, res, next) => {
  if (req.body.action && parseAction(req.body.action)) {
    switch (req.body.action) {
      case "ACCEPT_REQUEST": {
        await acceptRequest(req, res, next);
        break;
      }
      case "VIEW_REQUEST": {
        await viewRequest(req, res, next);
        break;
      }
      case "SEND_REQUEST": {
        await sendRequest(req, res, next);
        break;
      }
      case "REJECT_REQUEST": {
        await rejectRequest(req, res, next);
        break;
      }
      default: {
        res.status(500).send({
          error: true,
          body: req.action,
          message: "Invalid Action Type ",
        });
      }
    }
  }
};
module.exports = FriendRequest;

function parseAction(action) {
  let flag = false;
  ACTION_LIST.filter((value) => {
    if (value == action) {
      flag = true;
    }
  });
  return flag;
}

function acceptRequest(req, res, next) {}
async function viewRequest(req, res, next) {
  if (req.isAuthenticated) {
    const obj = await db.PendingRequest.findAll({
      where: {
        to: req.user.id,
      },
    });

    res.status(200).json({ error: false, message: "", body: obj });
  }
}
async function sendRequest(req, res, next) {
  if (req.isAuthenticated && req.body.to && !(req.body.to == req.user.id)) {
    const obj = await db.PendingRequest.build({
      from: req.user.id,
      to: req.body.to,
      status: "pending",
    });
    obj.save();
    res.status(200).json({ error: false, message: "Request Sent Successfull" });
  } else
    res
      .status(404)
      .json({ error: false, message: "Bad Request to  Key Required " });
}
async function rejectRequest(req, res, next) {
  if (req.isAuthenticated && req.body.from) {
    try {
      await db.PendingRequest.destroy({
        where: {
          from: req.body.from,
        },
      });
      res.status(200).json({ error: false, message: "Request Rejected " });
    } catch (e) {
      res.status(500).json({ error: false, message: "Internal Server Error " });
    }
  } else
    res
      .status(404)
      .json({ error: false, message: "Bad Request From Key Required " });
}
