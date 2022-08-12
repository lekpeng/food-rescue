const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new mongoose.Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
  },

  listing_owner_user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  listing_requester_user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Directmessage",
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
