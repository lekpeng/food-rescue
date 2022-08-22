// const listingValidators = require("../controllers/validators/listings");

// module.exports = {
//   createListing: (req, res, next) => {
//     const dateObj = new Date();
//     const year = dateObj.getFullYear().toString();
//     const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
//     const day = ("0" + dateObj.getDate()).slice(-2);
//     const todayDate = `${year}-${month}-${day}`;
//     let errorMsg = false;

//     const stuffToValidate = { ...req.body };
//     console.log("REQ BODY", stuffToValidate);
//     delete stuffToValidate["referer"];
//     const validationResults = listingValidators.createListingValidator.validate(stuffToValidate);

//     if (validationResults.error) {
//       console.log("MIDDLEWARE VALIDATION RESULTS ERROR");
//       errorMsg = validationResults.error.details[0].message;
//       res.render("listings/new", { errorMsg, todayDate, referer: req.headers.referer });
//       return;
//     }

//     console.log("middleware validaiton results", validationResults);
//     req.validationResults = validationResults;

//     next();
//   },

//   updateListing: (req, res, next) => {
//     res.send("update listing");
//     next();
//   },
// };
