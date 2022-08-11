const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new mongoose.Schema({
  //   listing: {
  //     type: Schema.Types.ObjectId,
  //     ref: "Listing",
  //   },
  handle: {
    type: String,
    required: true,
  },

  message: {
    type: String,
    required: true,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
