const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const chatModel = require("../../models/chats/chats");
const messageModel = require("../../models/chats/messages");
const userModel = require("../../models/users/users");

const controller = (server) => {
  const socket = require("socket.io");
  const io = socket(server);
  io.on("connection", async (socket) => {
    // Handle online event
    socket.on("online", async (chatId, username) => {
      socket.join(chatId);

      // TO DO: EMIT MESSAGE HISTORY

      const chat = await chatModel
        .findById(chatId)
        .populate({ path: "messages", populate: "user" })
        .exec();

      const messages = chat.messages.map((msg) => {
        return {
          username: msg.user.username,
          message: msg.message,
          timestamp: msg.createdAt,
        };
      });
      socket.emit("message-history", messages);
    });

    // Handle chat event
    socket.on("chat", async (chatId, data) => {
      // TODO: SAVING MESSAGE IN DB
      const user = await userModel.findOne({ username: data.username }).exec();
      const message = await messageModel.create({ user: user._id, message: data.message });
      // return value is unupdated chat
      const chat = await chatModel.findOneAndUpdate(
        { _id: chatId },
        {
          $push: { messages: message._id },
        }
      );

      io.sockets.to(chatId).emit("chat", data);

      // only do this for first message
      if (chat.messages.length === 0) {
        await userModel.findOneAndUpdate(
          { _id: chat.listing_owner_user },
          {
            $push: { chats: chatId },
          }
        );

        await userModel.findOneAndUpdate(
          { _id: chat.listing_requester_user },
          {
            $push: { chats: chatId },
          }
        );
      }
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

      // validate object ID (check if it's 24 digit hex something)
      if (!ObjectId.isValid(chatId)) {
        res.render("listings/show", {
          errorMsg: "Chat not found",
          listing: null,
        });
        return;
      }

      // validate authorisation to view chat
      const currentUser = req.session.currentUser;
      const chat = await chatModel
        .findById(chatId)
        .populate("listing")
        .populate("listing_owner_user")
        .populate("listing_requester_user")
        .exec();

      if (!chat) {
        res.render("listings/show", {
          errorMsg: "Chat not found",
          listing: null,
        });
      } else {
        if (
          currentUser.username === chat.listing_owner_user.username ||
          currentUser.username === chat.listing_requester_user.username
        ) {
          res.render("chats/show", {
            listing: chat.listing,
            listing_owner_username: chat.listing_owner_user.username,
            listing_requester_username: chat.listing_requester_user.username,
            username: currentUser.username,
            chatId,
          });
        } else {
          res.render("listings/show", {
            errorMsg: "Chat not found",
            listing: null,
          });
        }
      }
    },

    createChat: async (req, res) => {
      const currentUser = req.session.currentUser;
      const listingId = req.body.listing_id;

      // check whether an existing chat exists for this listing
      // if so, just redirect to that chat.

      const user = await userModel.findById(currentUser._id).populate("chats");
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

      // await userModel.findOneAndUpdate(
      //   { _id: currentUser._id },
      //   {
      //     $push: { chats: currentChat._id },
      //   }
      // );

      // await userModel.findOneAndUpdate(
      //   { _id: req.body.listing_owner_user_id },
      //   {
      //     $push: { chats: currentChat._id },
      //   }
      // );

      res.redirect(`/chats/${chatId}`);
    },
  };

  return modules;
};

module.exports = controller;
