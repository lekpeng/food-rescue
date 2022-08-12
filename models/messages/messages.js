const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
  //   listing: {
  //     type: Schema.Types.ObjectId,
  //     ref: "Listing",
  //   },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  message: {
    type: String,
    required: true,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
