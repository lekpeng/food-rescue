const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  listing_name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  pick_up_days_and_times: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  expiry_date: {
    type: Date,
    required: true,
  },

  // listing_image_url: {
  //   type: String,
  //   required: true,
  // },

  date_posted: {
    type: Date,
    default: Date.now,
  },

  distance_away: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    default: "available",
  },
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
