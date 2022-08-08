const listingModel = require("../../models/listings/listings");
const userModel = require("../../models/users/users");
const listingValidators = require("../validators/listings");
const mongoose = require("mongoose");

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

const controller = {
  index: async (req, res) => {
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
      console.log("userQuery", userQuery);
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
      console.log("!!!expiryFilter", expiryFilter);

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

      console.log("UPDATED FORM INPUTS", formInputs);

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
