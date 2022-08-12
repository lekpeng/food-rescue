const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const directmessageSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  chat: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
  },

  message: {
    type: String,
    required: true,
  },
});

const Directmessage = mongoose.model("Directmessage", directmessageSchema);

module.exports = Directmessage;
