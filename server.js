require("dotenv").config();

const userController = require("./controllers/users/users_controller.js");
const listingController = require("./controllers/listings/listings_controller.js");
const seeding = require("./seeds/seeding");

const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const socket = require("socket.io");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const session = require("express-session");
const authMiddleware = require("./middlewares/auth_middleware");
const methodOverride = require("method-override");

const app = express();
const port = process.env.PORT || 3000;
const mongoConnStr = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@generalassembly.z7wb6bg.mongodb.net/?retryWrites=true&w=majority`;

// const Message = require("./models/messages/messages");
const messageModel = require("./models/messages/messages");
const userModel = require("./models/users/users");

// CONFIGS
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

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      req.fileValidationError =
        "Invalid upload: Image should be in .png or .jpg format. Please try again";
      // return cb(
      //   new Error("Invalid upload: Image should be in .png or .jpg format. Please try again")
      // );
    }
  },
});

// SET/USE MIDDLEWARE
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

// Server

const server = app.listen(port, async () => {
  try {
    await mongoose.connect(mongoConnStr, { dbName: "food_rescue" });
  } catch (err) {
    console.log(`Failed to connect to DB`);
    process.exit(1);
  }
  console.log(`Food Rescue listening on port ${port}`);
});

const io = socket(server);

io.on("connection", async (socket) => {
  console.log("made socket connection", socket.id);

  // tODO: find history of message in DB and socket.emit()
  const data = await messageModel.find().populate("user").exec();
  console.log("DATA", data);
  const usernamesWithMessages = data.map((individualData) => {
    return { username: individualData.user.username, message: individualData.message };
  });
  socket.emit("message-history", usernamesWithMessages);

  // Handle chat event
  socket.on("chat", async (data) => {
    const user = await userModel.findOne({ username: data.username }).exec();
    await messageModel.create({ user: user._id, message: data.message });
    io.sockets.emit("chat", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
});

// ROUTES

// Main
app.get("/", authMiddleware.isAuthenticated, (req, res) => {
  res.redirect("/listings");
});

// Seed
app.get("/seed/users", seeding.seedUsers);
app.get("/seed/listings", seeding.seedListings);

// User
app.get("/login", userController.showLoginForm);
app.post("/login", userController.login);
app.get("/signup", userController.showSignupForm);
app.post("/signup", userController.signup);
app.delete("/logout", authMiddleware.isAuthenticated, userController.logout);
app.get("/users/:username", authMiddleware.isAuthenticated, userController.seeProfile);
app.get("/users", authMiddleware.isAuthenticated, userController.redirectProfile);

// Listing
// 1) Index
app.get("/listings", authMiddleware.isAuthenticated, listingController.indexListings);
// 2) New
app.get("/listings/new", authMiddleware.isAuthenticated, listingController.showNewListingForm); //!! more specific route first so new comes before :listingId
// 3) Show
app.get("/listings/:listingId", authMiddleware.isAuthenticated, listingController.showListing);
// 4) Create
app.post("/listings", upload.single("listing_image"), listingController.createListing);
// 5) Destroy
app.delete("/listings/:listingId", listingController.deleteListing);
// 6) Edit
app.get(
  "/listings/:listingId/edit",
  authMiddleware.isAuthenticated,
  listingController.showEditListingForm
);
// 7) Update
app.put("/listings/:listingId", upload.single("listing_image"), listingController.updateListing);

// Chat
app.get("/chat", authMiddleware.isAuthenticated, (req, res) => {
  res.render("pages/chat", {
    username: req.session.currentUser.username,
  });
});
