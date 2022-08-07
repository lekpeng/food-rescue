const userModel = require("../models/users/users");
const userSeedData = require("./seed_data/user_seed_data");
const bcrypt = require("bcrypt");
// const listingSeedData = require("./seed_data/listing_seed_data");

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

    console.log("USER SEEDING DONE");
    res.send("seeded");
  },
};

module.exports = seed;
