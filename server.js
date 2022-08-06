require("dotenv").config();

const userController = require("./controllers/users/users_controller");
const listingController = require("./controllers/listings/listings_controller");

const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const session = require("express-session");
const authMiddleware = require("./middlewares/auth_middleware");
const methodOverride = require("method-override");

const app = express();
const port = process.env.PORT || 3000;
const mongoConnStr = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@generalassembly.z7wb6bg.mongodb.net/?retryWrites=true&w=majority`;

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "DEV",
  },
});

const upload = multer({ storage: storage });

//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
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

//Login/Logout and Signup
app.get("/login", userController.showLoginForm);
app.post("/login", userController.login);
app.get("/signup", userController.showSignupForm);
app.post("/signup", userController.signup);
app.delete("/logout", userController.logout);

//Listings
// app.get("/listings", authMiddleware.isAuthenticated, listingController.index);
app.get("/listings", listingController.index);
app.get("/listings/new", listingController.showNewListingForm);
app.post("/listings", upload.single("listing-image"), listingController.createListing);
// to use: after testing done

app.listen(port, async () => {
  try {
    await mongoose.connect(mongoConnStr, { dbName: "food_rescue" });
  } catch (err) {
    console.log(`Failed to connect to DB`);
    process.exit(1);
  }
  console.log(`Food Rescue listening on port ${port}`);
});
