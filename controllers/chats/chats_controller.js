const messageModel = require("../../models/messages/messages");
const userModel = require("../../models/users/users");

const controller = (server) => {
  const socket = require("socket.io");
  const io = socket(server);
  const onlineUsers = {};
  io.on("connection", async (socket) => {
    console.log("made socket connection", socket.id);

    // Handle online event
    socket.on("online", (username) => {
      onlineUsers[socket.id] = username;
      io.sockets.emit("connected", username);
      io.sockets.emit("update-online-chat", onlineUsers);
      console.log("ONLINE USERS", onlineUsers);
    });

    const data = await messageModel.find().populate("user").exec();
    const usernamesWithMessages = data.map((individualData) => {
      return {
        username: individualData.user.username,
        message: individualData.message,
        timestamp: individualData.createdAt,
      };
    });
    socket.emit("message-history", usernamesWithMessages);

    // Handle chat event
    socket.on("chat", async (data) => {
      const user = await userModel.findOne({ username: data.username }).exec();
      await messageModel.create({ user: user._id, message: data.message });
      io.sockets.emit("chat", data);
    });

    socket.on("disconnect", () => {
      io.sockets.emit("disconnected", onlineUsers[socket.id]);
      delete onlineUsers[socket.id];
      io.sockets.emit("update-online-chat", onlineUsers);
    });

    // Handle typing event
    socket.on("typing", (data) => {
      socket.broadcast.emit("typing", data);
    });
  });

  const modules = {
    showChat: (req, res) => {
      res.render("pages/chat", {
        username: req.session.currentUser.username,
      });
    },
  };
  return modules;
};

module.exports = controller;
