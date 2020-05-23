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

async function acceptRequest(req, res, next) {
  if (req.isAuthenticated) {
    const obj = await db.PendingRequest.findOne({
      where: {
        from: req.user.id,
        to: req.body.to,
      },
    });
    if (obj) {
      const queryfrom = await db.Social.findOne({
        where: {
          from: req.user.id,
          to: req.body.to,
        },
      });
      const queryto = await db.Social.findOne({
        where: {
          to: req.user.id,
          from: req.body.to,
        },
      });
      if (!queryfrom && !queryto) {
        const from = await db.Social.build({
          from: req.user.id,
          to: req.body.to,
        });
        const to = await db.Social.build({
          to: req.user.id,
          from: req.body.to,
        });
        from.save();
        to.save();
        obj.destroy();
        res
          .status(200)
          .json({ error: false, message: "", body: "Request Accepted " });
      } else res.json(404).json({ error: "Already A Friend" });
    }
  } else res.json(500).json({ error: "ISR" });
}

async function viewRequest(req, res, next) {
  if (req.isAuthenticated) {
    const obj = await db.PendingRequest.findOne({
      where: {
        to: req.user.id,
      },
    });

    res.status(200).json({ error: false, message: "", body: obj });
  }
}
async function sendRequest(req, res, next) {
  if (
    req.isAuthenticated &&
    req.body.to &&
    !isNaN(req.body.to) &&
    !(req.body.to == req.user.id)
  ) {
    const isValidUser = await db.User.findOne({
      where: {
        id: req.body.to,
      },
    });
    if (isValidUser) {
      const query = await db.PendingRequest.findOne({
        where: {
          from: req.user.id,
          to: req.body.to,
        },
      });
      if (!query) {
        const obj = await db.PendingRequest.build({
          from: req.user.id,
          to: req.body.to,
          status: "pending",
        });
        obj.save();
        res
          .status(200)
          .json({ error: false, message: "Request Sent Successfull" });
      } else
        res
          .status(404)
          .json({ error: true, message: "Request Already Pending  " });
    } else res.status(404).json({ error: true, message: "Invalid User " });
  } else res.status(404).json({ error: true, message: "Bad Request" });
}
async function rejectRequest(req, res, next) {
  if (req.isAuthenticated && req.body.from && !isNaN(req.body.from)) {
    try {
      const obj = await db.PendingRequest.findOne({
        where: {
          from: req.body.from,
        },
      });
      if (obj) {
        obj.destroy();
        res.status(200).json({ error: false, message: "Request Rejected " });
      } else res.status(404).json({ error: false, message: "Bad Requst " });
    } catch (e) {
      res.status(500).json({ error: false, message: "Internal Server Error " });
    }
  } else
    res
      .status(404)
      .json({ error: false, message: "Bad Request From Key Required " });
}
