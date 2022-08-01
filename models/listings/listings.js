const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({
  poster_user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  status: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  listing_image: {
    type: String,
    required: true,
  },

  expiry_date: {
    type: Date,
    required: true,
  },

  pickup_location: {
    type: [Number],
  },

  pickup_days_and_times: {
    type: String,
    required: true,
  },

  date_posted: {
    type: Date,
    default: Date.now,
  },
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
