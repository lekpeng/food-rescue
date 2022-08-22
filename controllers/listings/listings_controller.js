require("dotenv").config({ path: "../../.env" });

const listingModel = require("../../models/listings/listings");
const userModel = require("../../models/users/users");
const cloudinary = require("cloudinary").v2;
const listingValidators = require("../validators/listings");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

const deg2rad = (deg) => deg * (Math.PI / 180);

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10;
};

const deleteCloudinaryImage = async (listingImgURL) => {
  const cloudinaryURL = listingImgURL.split(/[./]+/);
  const cloudinaryListingImgId = `DEV/${cloudinaryURL[cloudinaryURL.indexOf("DEV") + 1]}`;

  await cloudinary.uploader.destroy(cloudinaryListingImgId, (err, res) => {
    console.log(res, err);
  });
};

const controller = {
  indexListings: async (req, res) => {
    console.log("------->Indexing listings<--------");

    // get current user's location
    let userLat, userLon;
    try {
      [userLat, userLon] = req.session.currentUser.location;
    } catch (err) {
      userLat = 0;
      userLon = 0;
    }

    try {
      // filter and sort according to user query. default is latest, all categories.
      const mongooseFindFilter = {
        $and: [{ status: "available" }],
      };
      const formInputs = {
        sort: { latest: "on", nearest: "off" },
        categories: {
          "rice-and-noodles": "on",
          "bread-and-pastry": "on",
          snacks: "on",
          "fresh-produce": "on",
          condiments: "on",
          "canned-food": "on",
          beverage: "on",
          "chilled-and-frozen-food": "on",
        },
        expiry: {
          expired: "on",
          "not-expired": "on",
        },
      };
      // let mongooseSortFilter = { date_posted: 1 };
      const userQuery = req.query;
      const categoryFilter = [];
      const expiryFilter = {};

      for (const key in userQuery) {
        const today = new Date();
        // filters: expiry status
        if (key === "expired") {
          expiryFilter["$lte"] = today;
        }

        if (key === "not-expired") {
          expiryFilter["$gt"] = today;
        }
        // filters: categories
        if (key !== "sort") {
          categoryFilter.push(key);
        }
      }

      // update form inputs if not default
      if (categoryFilter.length) {
        mongooseFindFilter["$and"].push({ category: { $in: categoryFilter } });
        for (const category in formInputs.categories) {
          if (!categoryFilter.includes(category)) {
            formInputs["categories"][category] = "off";
          }
        }
      }

      if (Object.keys(expiryFilter).length === 1) {
        mongooseFindFilter["$and"].push({ expiry_date: expiryFilter });
        if (Object.keys(expiryFilter)[0] === "$lte") {
          formInputs["expiry"]["not-expired"] = "off";
        } else {
          formInputs["expiry"]["expired"] = "off";
        }
      }

      const allListings = await listingModel.find(mongooseFindFilter).populate("user").exec();
      const listings = allListings.map((listing) => {
        const [posterLat, posterLon] = listing.user.location;
        listing.category = (
          listing.category.charAt(0).toUpperCase() + listing.category.slice(1)
        ).replaceAll("-", " ");
        listing.distance_away = getDistanceFromLatLonInKm(userLat, userLon, posterLat, posterLon);
        return listing;
      });

      // default sort: by latest
      listings.sort((listingA, listingB) => {
        return Number(listingB.date_posted) - Number(listingA.date_posted);
      });

      if (userQuery.sort === "nearest") {
        formInputs.sort.latest = "off";
        formInputs.sort.nearest = "on";
        listings.sort((listingA, listingB) => {
          return listingA.distance_away - listingB.distance_away;
        });
      }

      res.render("listings/index", { listings, formInputs });
    } catch (err) {
      console.log("Err displaying listings", err);
    }
  },

  showListing: async (req, res) => {
    let currentUser, posterUser;

    // get current user's location
    let userLat, userLon;
    try {
      currentUser = req.session.currentUser;
      [userLat, userLon] = currentUser.location;
    } catch (err) {
      userLat = 0;
      userLon = 0;
    }

    // get the listing ID from the route param
    const listingId = req.params.listingId;
    let listing;
    // validate object ID (check if it's 24 digit hex something)
    if (!ObjectId.isValid(listingId)) {
      res.render("listings/show", {
        errorMsg: "Listing not found",
        listing: null,
      });
      return;
    }

    // get the listing with the id from the database
    try {
      listing = await listingModel.findById(listingId).populate("user").exec();
      const [posterLat, posterLon] = listing.user.location;
      listing.category = (
        listing.category.charAt(0).toUpperCase() + listing.category.slice(1)
      ).replaceAll("-", " ");
      listing.distance_away = getDistanceFromLatLonInKm(userLat, userLon, posterLat, posterLon);
      posterUser = listing.user;
    } catch (err) {
      res.render("listings/show", {
        errorMsg: "Failed to retrieve listing. Please refresh.",
        listing: [],
      });
      return;
    }

    // render the "show" ejs template

    res.render("listings/show", {
      errorMsg: "",
      listing,
      currentUserIsPoster: currentUser.username === posterUser.username,
      apiKey: process.env.ESRI_API_KEY,
    });
  },

  showNewListingForm: (req, res) => {
    console.log("------->Show New Listing Form<--------");
    const dateObj = new Date();
    const year = dateObj.getFullYear().toString();
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const day = ("0" + dateObj.getDate()).slice(-2);
    const todayDate = `${year}-${month}-${day}`;
    res.render("listings/new", {
      todayDate,
      errorMsg: null,
    });
  },

  createListing: async (req, res) => {
    console.log("------->Create New Listing<--------");
    const dateObj = new Date();
    const year = dateObj.getFullYear().toString();
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const day = ("0" + dateObj.getDate()).slice(-2);
    const todayDate = `${year}-${month}-${day}`;
    const currentUser = req.session.currentUser;

    // validation for req.body
    let errorMsg = false;

    // validation for req.file -> upload in wrong format
    if (req.fileValidationError) {
      errorMsg = req.fileValidationError;
      res.render("listings/new", {
        errorMsg,
        todayDate,
      });
      return;
    }

    // validation for req.body
    const listingImgURL = req.file.path;
    const stuffToValidate = { ...req.body };
    const validationResults = listingValidators.createListingValidator.validate(stuffToValidate);

    if (validationResults.error) {
      deleteCloudinaryImage(listingImgURL);
      errorMsg = validationResults.error.details[0].message;
      res.render("listings/new", {
        errorMsg,
        todayDate,
      });
      return;
    }

    const validatedResults = validationResults.value;

    try {
      // create the listing and store in DB
      const currentListing = {
        _id: new mongoose.Types.ObjectId(),
        user: currentUser._id,
        listing_name: validatedResults.listing_name,
        description: validatedResults.description,
        pick_up_days_and_times: validatedResults.pick_up_days_and_times,
        category: validatedResults.category,
        expiry_date: validatedResults.expiry_date,
        listing_image_url: req.file.path,
      };

      await listingModel.create(currentListing);

      // add listing to user (this works)
      await userModel.findOneAndUpdate(
        { _id: currentUser._id },
        {
          $push: { listings: currentListing._id },
        }
      );
    } catch (err) {
      deleteCloudinaryImage(listingImgURL);
      errorMsg = err;
      res.render("listings/new", {
        errorMsg,
        todayDate,
      });
      return;
    }

    res.redirect("/");
    // }
  },

  deleteListing: async (req, res) => {
    const listingId = req.params.listingId;

    // need delete reference from owner of listing
    const listing = await listingModel.findById(listingId).populate("user").exec();
    await userModel.findOneAndUpdate(
      { _id: listing.user._id },
      {
        $pull: { listings: listing._id },
      }
    );

    deleteCloudinaryImage(listing.listing_image_url);

    // delete listing
    await listingModel.findByIdAndDelete(listingId).exec();
    res.redirect("/");
  },

  showEditListingForm: async (req, res) => {
    console.log("------->Show Edit Listing Form<--------");
    // make sure form displays only if user is owner
    const currentUserUsername = req.session.currentUser.username;
    const listingId = req.params.listingId;
    const listing = await listingModel.findById(listingId).populate("user").exec();

    if (listing.user.username !== currentUserUsername) {
      res.render("pages/unauthorized");
      return;
    }

    const statusForm = {
      available: "no",
      reserved: "no",
      taken: "no",
    };
    statusForm[listing.status] = "yes";

    const categoryForm = {
      "rice-and-noodles": "no",
      "bread-and-pastry": "no",
      snacks: "no",
      "fresh-produce": "no",
      condiments: "no",
      "canned-food": "no",
      beverage: "no",
      "chilled-and-frozen-food": "no",
    };
    categoryForm[listing.category] = "yes";

    const dateObj = listing.expiry_date;
    const year = dateObj.getFullYear().toString();
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const day = ("0" + dateObj.getDate()).slice(-2);
    const expiryDate = `${year}-${month}-${day}`;

    res.render("listings/edit", {
      expiryDate,
      categoryForm,
      statusForm,
      listing,
      errorMsg: null,
    });
  },

  updateListing: async (req, res) => {
    const currentUserUsername = req.session.currentUser.username;
    const listingId = req.params.listingId;
    const listing = await listingModel.findById(listingId).populate("user").exec();

    if (listing.user.username !== currentUserUsername) {
      res.render("pages/unauthorized");
      return;
    }

    const statusForm = {
      available: "no",
      reserved: "no",
      taken: "no",
    };
    statusForm[listing.status] = "yes";

    const categoryForm = {
      "rice-and-noodles": "no",
      "bread-and-pastry": "no",
      snacks: "no",
      "fresh-produce": "no",
      condiments: "no",
      "canned-food": "no",
      beverage: "no",
      "chilled-and-frozen-food": "no",
    };
    categoryForm[listing.category] = "yes";

    const dateObj = listing.expiry_date;
    const year = dateObj.getFullYear().toString();
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const day = ("0" + dateObj.getDate()).slice(-2);
    const expiryDate = `${year}-${month}-${day}`;

    console.log("-------> Update listing <----------");
    const currentUser = req.session.currentUser;

    // validation for req.body
    let errorMsg = false;
    const validationResults = listingValidators.editListingValidator.validate(req.body);

    if (validationResults.error) {
      if (req.file) {
        deleteCloudinaryImage(req.file.path);
      }
      errorMsg = validationResults.error.details[0].message;
      res.render("listings/edit", {
        expiryDate,
        categoryForm,
        statusForm,
        listing,
        errorMsg,
      });
      return;
    }

    const validatedResults = validationResults.value;

    // validation for req.file -> upload in wrong format
    if (req.fileValidationError) {
      errorMsg = req.fileValidationError;
      res.render("listings/edit", {
        expiryDate,
        categoryForm,
        statusForm,
        listing,
        errorMsg,
      });
      return;
    }
    // update the listing and store in DB
    let updateListing;
    if (req.file) {
      updateListing = {
        status: validatedResults.status,
        listing_name: validatedResults.listing_name,
        description: validatedResults.description,
        pick_up_days_and_times: validatedResults.pick_up_days_and_times,
        category: validatedResults.category,
        expiry_date: validatedResults.expiry_date,
        listing_image_url: req.file.path,
      };

      // remove old img from cloudinary
      const oldListing = await listingModel.findById(listingId).exec();
      deleteCloudinaryImage(oldListing.listing_image_url);
    } else {
      updateListing = {
        status: validatedResults.status,
        listing_name: validatedResults.listing_name,
        description: validatedResults.description,
        pick_up_days_and_times: validatedResults.pick_up_days_and_times,
        category: validatedResults.category,
        expiry_date: validatedResults.expiry_date,
      };
    }

    await listingModel.findOneAndUpdate({ _id: listingId }, updateListing);
    res.redirect(`/listings/${listingId}`);
  },
};

module.exports = controller;
