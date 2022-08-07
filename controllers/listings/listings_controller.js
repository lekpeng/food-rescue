const listingModel = require("../../models/listings/listings");
const userModel = require("../../models/users/users");
const listingValidators = require("../validators/listings");
const mongoose = require("mongoose");

const controller = {
  index: async (req, res) => {
    console.log("------->Indexing listings<--------");
    const userQuery = req.query;

    console.log("userQuery", userQuery);

    // filter and sort according to user query. default is latest, all categories.
    // show only those avail
    // format expiry date
    // get distance away from user POV and display accordingly

    try {
      const listings = await listingModel.find({ status: "available" }).exec();

      res.render("listings/index", { listings });
    } catch (err) {
      console.log("Err displaying listings", err);
    }
  },

  showNewListingForm: (req, res) => {
    console.log("------->Show New Listing Form<--------");
    const dateObj = new Date();
    const year = dateObj.getFullYear().toString();
    const month = ("0" + dateObj.getDate()).slice(-2);
    const day = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const todayDate = `${year}-${month}-${day}`;
    res.render("listings/new", { todayDate, errorMsg: false });
  },

  createListing: async (req, res) => {
    console.log("------->Create New Listing<--------");
    console.log("req.file", req.file);
    // console.log("------->req.file.path", req.file.path);

    const currentUser = req.session.currentUser;
    console.log("!!!!currentUser", currentUser);

    // validation for req.body
    let errorMsg = false;
    const validationResults = listingValidators.createListingValidator.validate(req.body);

    if (validationResults.error) {
      errorMsg = validationResults.error.details[0].message;
      res.render("listings/new", { errorMsg });
      return;
    }

    const validatedResults = validationResults.value;

    // validation for req.file -> upload in wrong format
    // if (req.fileValidationError) {
    //   errorMsg = req.fileValidationError;
    //   res.render("listings/new", { errorMsg });
    //   return;
    // }

    // try {
    // create the listing and store in DB
    const currentListing = {
      _id: new mongoose.Types.ObjectId(),
      user: currentUser._id,
      listing_name: validatedResults.listing_name,
      description: validatedResults.description,
      pick_up_days_and_times: validatedResults.pick_up_days_and_times,
      category: validatedResults.category,
      expiry_date: validatedResults.expiry_date,
      // listing_image_url: req.file.path,
    };

    await listingModel.create(currentListing);

    // add listing to user (this works)
    await userModel.findOneAndUpdate(
      { _id: currentUser._id },
      {
        $push: { listings: currentListing._id },
      }
    );

    // } catch (err) {
    //   errorMsg = "Something went wrong. Please try creating the listing again.";
    //   res.render("listings/new", { errorMsg });
    //   return;
    // }

    res.redirect("/listings");
  },
};

module.exports = controller;
