const bcrypt = require("bcrypt");

const users = [
  {
    username: "ryan",
    email: "ryan@gmail.com",
    password: "ryan1234",
    location: [100, 50],
  },

  {
    username: "charlie",
    email: "charlie@gmail.com",
    password: "charlie1234",
    location: [200, 50],
  },
];

module.exports = users;
