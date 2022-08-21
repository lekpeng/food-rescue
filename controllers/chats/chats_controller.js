const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const chatModel = require("../../models/chats/chats");
const messageModel = require("../../models/chats/messages");
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

    // TO DO: EMIT MESSAGE HISTORY

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
      // TODO: SAVING MESSAGE IN DB
      // const user = await userModel.findOne({ username: data.username }).exec();
      // await messageModel.create({ user: user._id, message: data.message });
      // add chat to user perhaps after user sends a message

      io.sockets.to(chatId).emit("chat", data);
    });

    // Handle typing event
    socket.on("typing", (chatId, data) => {
      socket.broadcast.to(chatId).emit("typing", data);
    });
  });

  const modules = {
    indexChats: async (req, res) => {
      const currentUser = req.session.currentUser;

      const user = await userModel
        .findById(currentUser._id)
        .populate({
          path: "chats",
          populate: [
            { path: "listing" },
            { path: "listing_owner_user" },
            { path: "listing_requester_user" },
          ],
        })
        .exec();

      const chats = user.chats;
      res.render("chats/index", { username: currentUser.username, chats });
    },

    showChat: async (req, res) => {
      // TODO: validation to makes sure only authorised people can view the chat
      const chatId = req.params.chatId;

      const chat = await chatModel
        .findById(chatId)
        .populate("listing")
        .populate("listing_owner_user")
        .exec();

      res.render("chats/show", {
        listing_name: chat.listing.listing_name,
        listing_owner_user: chat.listing_owner_user.username,
        username: req.session.currentUser.username,
        chatId,
      });
    },

    createChat: async (req, res) => {
      const currentUser = req.session.currentUser;
      const listingId = req.body.listing_id;

      // TODO: check whether an existing chat exists for this listing
      // if so, just redirect to that chat.

      const user = await userModel.findById(currentUser._id).populate("chats");
      console.log("user", user);
      const existingChat = user.chats.find((chat) => {
        return chat.listing.toString() === listingId;
      });
      // const userChatsListingIds = user.chats.map(chat => chat.listing)
      if (existingChat) {
        chatId = existingChat._id;
        res.redirect(`/chats/${chatId}`);
        return;
      }

      chatId = new mongoose.Types.ObjectId();

      // create the listing and store in DB
      const currentChat = {
        _id: chatId,
        listing: listingId,
        listing_owner_user: req.body.listing_owner_user_id,
        listing_requester_user: currentUser._id,
      };

      await chatModel.create(currentChat);

      await userModel.findOneAndUpdate(
        { _id: currentUser._id },
        {
          $push: { chats: currentChat._id },
        }
      );

      await userModel.findOneAndUpdate(
        { _id: req.body.listing_owner_user_id },
        {
          $push: { chats: currentChat._id },
        }
      );

      res.redirect(`/chats/${chatId}`);
    },
  };

  return modules;
};

module.exports = controller;
