require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const authMiddleware = require("./middlewares/auth_middleware");

const app = express();
const port = process.env.PORT || 3000;
const mongoConnStr = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@generalassembly.z7wb6bg.mongodb.net/?retryWrites=true&w=majority`;

const userController = require("./controllers/users/users_controller");

//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SESSION_SECRET, // should keep in env file
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: false },
  })
);

//ROUTES

//Main
app.get("/", authMiddleware.isAuthenticated, (req, res) => {
  res.redirect("/listings");
});
// app.get("/", (req, res) => {
//   if (req.session.user) {
//     res.redirect("/listings");
//   } else {
//     res.redirect("/login");
//   }
// });

//Login and Signup
app.get("/login", userController.showLoginForm);
app.post("/login", userController.login);
app.get("/signup", userController.showSignupForm);
app.post("/signup", userController.signup);

//Listings
// app.get("/listings", authMiddleware.isAuthenticated, listingController.index);

app.listen(port, async () => {
  try {
    await mongoose.connect(mongoConnStr, { dbName: "food_rescue" });
  } catch (err) {
    console.log(`Failed to connect to DB`);
    process.exit(1);
  }
  console.log(`Food Rescue listening on port ${port}`);
});
