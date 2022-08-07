const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  listings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],

  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  hash: {
    type: String,
    required: true,
  },

  location: {
    type: [Number],
    required: true,
  },
});

const User = mongoose.model("User", userSchema); //User is converted to users as the collection name

module.exports = User;
