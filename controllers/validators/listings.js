const Joi = require("joi");

const validators = {
  createListingValidator: Joi.object({
    listing_name: Joi.string().min(6).max(30).required().label("Listing name"),
    description: Joi.string().max(200).label("Description"),
    pick_up_days_and_times: Joi.string().max(30).required().label("Pick up days and times"),
    category: Joi.string()
      .required()
      .valid(
        "Rice and Noodles",
        "Bread and Pastry",
        "Snacks",
        "Fresh Produce",
        "Condiments",
        "Canned Food",
        "Beverage",
        "Chilled and Frozen Food"
      )
      .label("Category"),
    expiry_date: Joi.date().required().label("Expiry Date"),
  }),
};

module.exports = validators;
