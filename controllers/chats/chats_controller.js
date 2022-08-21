// TODO: Have two separate chat rooms

const messageModel = require("../../models/messages/messages");
const userModel = require("../../models/users/users");

const controller = (server) => {
  const socket = require("socket.io");
  const io = socket(server);
  // const onlineUsers = {};
  io.on("connection", async (socket) => {
    console.log("made socket connection", socket.id);

    // Handle online event
    socket.on("online", (chatId, username) => {
      socket.join(chatId);
    });

    // const data = await messageModel.find().populate("user").exec();
    // const usernamesWithMessages = data.map((individualData) => {
    //   return {
    //     username: individualData.user.username,
    //     message: individualData.message,
    //     timestamp: individualData.createdAt,
    //   };
    // });
    // socket.emit("message-history", usernamesWithMessages);

    // Handle chat event
    socket.on("chat", async (chatId, data) => {
      const user = await userModel.findOne({ username: data.username }).exec();
      await messageModel.create({ user: user._id, message: data.message });
      io.sockets.to(chatId).emit("chat", data);
    });

    // Handle typing event
    socket.on("typing", (chatId, data) => {
      socket.broadcast.to(chatId).emit("typing", data);
    });
  });

  const modules = {
    showChat: (req, res) => {
      // get the chat ID from the route param
      const chatId = req.params.chatId;
      res.render("pages/chat", {
        username: req.session.currentUser.username,
        chatId,
      });
    },
  };

  return modules;
};

module.exports = controller;
