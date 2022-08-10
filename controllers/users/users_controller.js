const bcrypt = require("bcrypt");
const userModel = require("../../models/users/users");
const listingModel = require("../../models/listings/listings");
const userValidators = require("../validators/users");

const controller = {
  showLoginForm: (req, res) => {
    console.log("----->Show login forms<-----");
    res.render("pages/login", { errorMsg: false });
  },

  login: async (req, res) => {
    console.log("------->Log in<-------");

    // validation
    let errorMsg = false;
    const validationResults = userValidators.loginValidator.validate(req.body);

    if (validationResults.error) {
      errorMsg = validationResults.error.details[0].message;
      // const rawMessage = validationResults.error.details[0].message;
      // errorMsg = rawMessage.charAt(0) + rawMessage.charAt(1).toUpperCase() + rawMessage.slice(2);
      res.render("pages/login", { errorMsg });
      return;
    }

    const validatedResults = validationResults.value;

    let user = null;

    // get user with email from DB
    try {
      user = await userModel.findOne({ username: validatedResults.username });
    } catch (err) {
      res.render("pages/login", { errorMsg: "Something went wrong. Please try again." });
      return;
    }

    // Username not in database

    if (!user) {
      res.render("pages/login", {
        errorMsg: "Username not found. Please sign up if you do not have an existing account.",
      });
      return;
    }

    // use bcrypt to compare the given password with the one store as has in DB
    const pwMatches = await bcrypt.compare(validatedResults.password, user.hash);

    if (!pwMatches) {
      res.render("pages/login", { errorMsg: "Incorrect password. Please try again." });
      return;
    }

    // log the user in by creating a session
    req.session.regenerate(function (err) {
      if (err) {
        res.render("pages/login", { errorMsg: "Something went wrong. Please try again." });
        return;
      }

      // store user information in session, typically a user id
      req.session.currentUser = user;

      // save the session before redirection to ensure page
      // load does not happen before session is saved
      req.session.save(function (err) {
        if (err) {
          res.render("pages/login", { errorMsg: "Something went wrong. Please try again." });
          return;
        }

        res.redirect("/listings");
      });
    });
  },

  logout: (req, res) => {
    console.log("------->Log out<-------");
    req.session.destroy(() => {
      res.redirect("/login");
    });
  },

  showSignupForm: (req, res) => {
    console.log("----->Show sign up form-----");
    res.render("pages/signup", { errorMsg: false });
  },

  signup: async (req, res) => {
    console.log("------->Sign up<---- ---");

    // validation
    let errorMsg = false;
    const validationResults = userValidators.signupValidator.validate(req.body);
    if (validationResults.error) {
      errorMsg = validationResults.error.details[0].message;

      if (errorMsg.includes("[ref:password]")) {
        errorMsg = "The two passwords did not match. Please try again.";
      }

      res.render("pages/signup", { errorMsg });
      return;
    }

    const validatedResults = validationResults.value;

    // hash the password
    const hash = await bcrypt.hash(validatedResults.password, 10);

    // get location in right form
    const rawLocation = validatedResults.location.split(/[\s,()]+/);
    const location = [Number(rawLocation[1]), Number(rawLocation[2])];

    // create the user and store in db
    try {
      await userModel.create({
        username: validatedResults.username,
        email: validatedResults.email,
        hash: hash,
        location: location,
      });
    } catch (err) {
      errorMsg =
        "Either the username or email address has been used before. Please use a different username/email address or login if you have an existing account with us.";
      res.render("pages/signup", { errorMsg });
      return;
    }

    res.redirect("/login");
  },

  redirectProfile: async (req, res) => {
    const currentUserUsername = req.session.currentUser.username;
    res.redirect(`/users/${currentUserUsername}`);
  },

  seeProfile: async (req, res) => {
    let errorMsg;
    const username = req.params.username;
    const currentUserUsername = req.session.currentUser.username;
    const allListings = await listingModel.find({}).populate("user").exec();
    const listings = allListings.filter((listing) => listing.user.username === username);

    listings.sort((listingA, listingB) => {
      return Number(listingB.date_posted) - Number(listingA.date_posted);
    });

    if (!listings.length) {
      errorMsg = "User not found!";
    }
    res.render("pages/profile", {
      listings,
      username,
      errorMsg,
      isProfileOwner: username === currentUserUsername,
    });
  },
};

module.exports = controller;
