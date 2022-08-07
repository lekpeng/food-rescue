const userModel = require("../models/users/users");
const listingModel = require("../models/listings/listings");
const userSeedData = require("./seed_data/user_seed_data");
const listingSeedData = require("./seed_data/listing_seed_data");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const seed = {
  seedUsers: async (req, res) => {
    // alternative: using callback
    // userSeedData.forEach(async (user) => {
    //   bcrypt.hash(user.password, 10, async (err, hash) => {
    //     // Store hash in your password DB.
    //     user.hash = hash;
    //     delete user.password;
    //     await userModel.create(user);
    //   });
    // });

    const data = await Promise.all(
      userSeedData.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.hash = hashedPassword;
        delete user.password;
        return user;
      })
    );

    await userModel.insertMany(data);

    res.send("seeded users!");
  },

  seedListings: async (req, res) => {
    // get usernames
    const usernames = userSeedData.map((user) => user.username);
    const numberUsernames = usernames.length;

    const data = await Promise.all(
      listingSeedData.map(async (listing, index) => {
        listing._id = new mongoose.Types.ObjectId();
        const usernameAssigned = usernames[index % numberUsernames];
        const userAssigned = await userModel.findOne({
          username: usernameAssigned,
        });

        // assign listing to user and user to listing
        listing.user = userAssigned._id;
        await userModel.findOneAndUpdate(
          { username: usernameAssigned },
          {
            $push: { listings: listing._id },
          }
        );
        return listing;
      })
    );
    await listingModel.insertMany(data);

    res.send("seeded listings");
  },
};

module.exports = seed;
